"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MessageCircle, Check, X, Minus, Loader2, ShieldCheck } from "lucide-react";
import styles from "./pricing.module.css";
import pageStyles from "../page.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

type Currency = "USD" | "INR" | "EUR" | "GBP" | "CAD" | "AUD" | "NZD" | "ZAR" | "SGD" | "NGN";

function detectCurrency(user: ReturnType<typeof useUser>['user']): Currency {
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  if (email.endsWith(".in")) return "INR";
  if (email.endsWith(".uk") || email.endsWith(".co.uk")) return "GBP";
  if (email.endsWith(".ca")) return "CAD";
  if (email.endsWith(".au") || email.endsWith(".com.au")) return "AUD";
  if (email.endsWith(".nz") || email.endsWith(".co.nz")) return "NZD";
  if (email.endsWith(".za") || email.endsWith(".co.za")) return "ZAR";
  if (email.endsWith(".sg") || email.endsWith(".com.sg")) return "SGD";
  if (email.endsWith(".ng") || email.endsWith(".com.ng")) return "NGN";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Kolkata")) return "INR";
    if (tz.includes("London")) return "GBP";
    if (tz.includes("Australia/")) return "AUD";
    if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Edmonton")) return "CAD";
    if (tz.includes("Auckland")) return "NZD";
    if (tz.includes("Johannesburg")) return "ZAR";
    if (tz.includes("Singapore")) return "SGD";
    if (tz.includes("Lagos")) return "NGN";
    if (tz.startsWith("Europe/") && !tz.includes("London")) return "EUR";
  } catch { /* ignore */ }
  return "INR";
}

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("INR");

  // Sync initial currency
  useEffect(() => {
    const saved = localStorage.getItem("selected-currency");
    if (saved) {
      setCurrency(saved as Currency);
    } else if (user) {
      setCurrency(detectCurrency(user));
    }
  }, [user]);

  // Sync on global changes
  useEffect(() => {
    const handleGlobalChange = () => {
      const savedNew = localStorage.getItem("selected-currency");
      if (savedNew) {
        setCurrency(savedNew as Currency);
      }
    };
    window.addEventListener("currency-change", handleGlobalChange);
    return () => window.removeEventListener("currency-change", handleGlobalChange);
  }, []);

  const [isAnnual, setIsAnnual] = useState(false);
  const [showTest3MModal, setShowTest3MModal] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activePromo, setActivePromo] = useState<{code: string, type: string, value: number} | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasPurchasedBefore, setHasPurchasedBefore] = useState<boolean>(true); // default to true to be safe
  const [autorenew, setAutorenew] = useState(true);

  // Sync the plan status if possible
  useEffect(() => {
    const fetchStep = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const { data } = await res.json();
          if (data?.plan) setUserPlan(data.plan);
          if (typeof data?.has_purchased_before === 'boolean') {
            setHasPurchasedBefore(data.has_purchased_before);
          }
        }
      } catch (e) {
        console.error("Failed to sync plan on pricing", e);
      }
    };
    fetchStep();
  }, []);

  const handleRazorpayCheckout = async () => {
    if (!user) {
      router.push("/sign-up");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // amount is now calculated securely on the backend.
          currency,
          receipt: `rcpt_${Date.now()}`,
          promoCode: activePromo ? activePromo.code : undefined,
          billingCycle: 'monthly',
          autorenew
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Server could not create Razorpay order.");
      }

      // If the backend bypassed Razorpay (e.g., 100% free trial), redirect immediately
      if (orderData.bypassed) {
        router.push("/payment-success");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AutoDROP",
        description: `Upgrade to Growth Pro (Monthly)`,
        image: "https://autodrop.framer.website/logo.png",
        ...(orderData.id.startsWith("sub_") ? { subscription_id: orderData.id } : { order_id: orderData.id }),
        handler: async function (response: any) {
          const isSub = !!response.razorpay_subscription_id;
          const verifyEndpoint = isSub 
             ? "/api/billing/razorpay/verify-subscription"
             : "/api/billing/razorpay/verify-payment";

          const verifyRes = await fetch(verifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              razorpay_subscription_id: response.razorpay_subscription_id
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push("/payment-success");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#6366F1",
        },
      };

      if (!options.key) {
        throw new Error("Razorpay Public Key is missing in environment variables.");
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rates: Record<Currency, { pro: number, elite: number }> = {
    USD: { pro: 4.99, elite: 99 },
    GBP: { pro: 3.99, elite: 79 },
    CAD: { pro: 6.99, elite: 135 },
    AUD: { pro: 7.99, elite: 149 },
    NZD: { pro: 8.99, elite: 164 },
    EUR: { pro: 4.99, elite: 89 },
    ZAR: { pro: 99, elite: 1880 },
    SGD: { pro: 6.99, elite: 133 },
    INR: { pro: 449, elite: 8200 },
    NGN: { pro: 6990, elite: 148500 },
  };

  const firstMonthRates: Record<Currency, number> = {
    USD: 1.99,
    GBP: 1.49,
    CAD: 1.99,
    AUD: 1.99,
    NZD: 1.99,
    EUR: 1.49,
    ZAR: 29,
    SGD: 1.99,
    INR: 99,
    NGN: 1990,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getOriginalPrice = (rate: number) => {
    if (rate === 449) return 699;
    if (rate === 4.99) return 9.99;
    if (rate === 3.99) return 7.99;
    if (rate === 6.99) return 13.99;
    if (rate === 7.99) return 15.99;
    if (rate === 8.99) return 17.99;
    if (rate === 99) return 199;
    if (rate === 6990) return 13990;
    return Math.ceil(rate * 2) - (Number.isInteger(rate) ? 0 : 0.01);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/billing/verify-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        if (data.code === 'TEST3M') {
          setShowTest3MModal(true);
        }
        setActivePromo({ code: data.code, type: data.discount_type, value: data.discount_value });
        setPromoMessage({ text: "Promo code applied!", type: "success" });
      } else {
        setActivePromo(null);
        setPromoMessage({ text: data.error || "Invalid code", type: "error" });
      }
    } catch (e) {
      setPromoMessage({ text: "Failed to verify code", type: "error" });
    } finally {
      setPromoLoading(false);
    }
  };

  const getPrice = (baseTierPrice: number, applyPromo = true) => {
    // Check if eligible for first month trial
    if (!hasPurchasedBefore) {
      // Return the introductory rate
      baseTierPrice = firstMonthRates[currency] || 99;
    }
    let price = baseTierPrice;
    
    if (applyPromo && activePromo) {
      if (activePromo.type === 'percentage') {
        price = Math.max(0, Math.round(price - (price * (activePromo.value / 100))));
      } else if (activePromo.type === 'fixed') {
        price = Math.max(0, price - activePromo.value);
      }
    }
    return price;
  };

  const currentRate = rates[currency];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Header activePath="pricing" />

      <main className={styles.pricingContainer} style={{ position: 'relative', flex: 1, paddingTop: '140px' }}>
        <div className={styles.blob} />
        <header className={styles.header}>
          <h1 className={styles.title}>Simple, transparent pricing</h1>
          <p className={styles.subtitle}>Unlock AutoDrop&apos;s full potential and convert your audience into revenue.</p>
        </header>

        <div className={styles.controlsRow}>

          {/* Currency Selector */}
          <div className={styles.currencyWrapper}>
            <label htmlFor="currency" className={styles.currencyLabel}>Currency:</label>
            <select 
              id="currency" 
              className={styles.currencySelect}
              value={currency} 
              onChange={(e) => {
                const val = e.target.value as Currency;
                setCurrency(val);
                localStorage.setItem("selected-currency", val);
                window.dispatchEvent(new Event("currency-change"));
              }}
            >
              <option value="INR">INR (₹) - India</option>
              <option value="USD">USD ($) - United States</option>
              <option value="AUD">AUD (A$) - Australia</option>
              <option value="CAD">CAD (C$) - Canada</option>
              <option value="EUR">EUR (€) - Ireland & EU</option>
              <option value="GBP">GBP (£) - United Kingdom</option>
              <option value="NGN">NGN (₦) - Nigeria</option>
              <option value="NZD">NZD (NZ$) - New Zealand</option>
              <option value="SGD">SGD (S$) - Singapore</option>
              <option value="ZAR">ZAR (R) - South Africa</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Free Plan */}
          <div className={styles.card}>
            <h3 className={styles.planName}>Free Starter</h3>
            <div className={styles.price}>
              <span style={{ textDecoration: 'line-through', fontSize: '1.2rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                {formatPrice(currency === 'INR' ? 199 : 1.99)}
              </span>
              {formatPrice(0)}
              <span className={styles.period}>/mo</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.15rem 0.4rem', borderRadius: '6px', marginLeft: '0.5rem', verticalAlign: 'middle', fontWeight: 700, whiteSpace: 'nowrap' }}>100% OFF</span>
            </div>
            <p className={styles.description}>Get started with comment &amp; keyword automation for free.</p>
            <ul className={styles.features}>
              <li>1 Connected IG Account</li>
              <li>1 Active Automation</li>
              <li>Post &amp; Reel Comment Replies (1 Post Limit)</li>
              <li>Spintax Replies (Anti-Ban Humanizer)</li>
              <li>Text &amp; Emoji Keywords</li>
              <li>Unlimited DMs &amp; Comments</li>
              <li>Basic Analytics</li>
            </ul>
            <Link href="/dashboard" className={styles.primaryBtn}>Current Plan</Link>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.card} ${styles.proCard}`}>
            <div className={styles.badge}>Most Popular</div>
            <h3 className={styles.planName}>Growth Pro</h3>
            <div className={styles.price}>
              <span style={{ textDecoration: 'line-through', fontSize: '1.2rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                {formatPrice(getOriginalPrice(currentRate.pro))}
              </span>
              {activePromo || !hasPurchasedBefore ? (
                <span style={{ textDecoration: 'line-through', fontSize: '1.2rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                  {formatPrice(currentRate.pro)}
                </span>
              ) : null}
              {formatPrice(getPrice(currentRate.pro))}
              <span className={styles.period}>/mo</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.15rem 0.4rem', borderRadius: '6px', marginLeft: '0.5rem', verticalAlign: 'middle', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {Math.round(((getOriginalPrice(currentRate.pro) - getPrice(currentRate.pro)) / getOriginalPrice(currentRate.pro)) * 100)}% OFF
              </span>
            </div>
            {!hasPurchasedBefore && (
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
                First month introductory offer. Renews at regular price.
              </div>
            )}
            <p className={styles.description}>Full funnel automation to capture leads and scale.</p>
            <ul className={styles.features}>
              <li>Connect up to 3 IG Accounts</li>
              <li>Everything in Free</li>
              <li>Post, Reel &amp; Story Automation</li>
              <li>Spintax Replies (Anti-Ban Humanizer)</li>
              <li>DM Keyword Automation</li>
              <li>Lead Capture</li>
              <li>Follow-Gate Links</li>
              <li>Unlimited Automations</li>
              <li>Priority Support</li>
            </ul>
            {userPlan === 'PRO' || userPlan === 'ELITE' ? (
               <Link href="/dashboard" className={styles.primaryBtn}>Current Plan</Link>
            ) : (
               <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <input 
                     type="text" 
                     placeholder="Promo Code" 
                     value={promoCodeInput}
                     onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                     style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(128, 128, 128, 0.05)', color: 'var(--text-main)', textTransform: 'uppercase' }}
                   />
                   <button 
                     onClick={handleApplyPromo} 
                     disabled={promoLoading || !promoCodeInput.trim()}
                     style={{ padding: '0 1rem', borderRadius: '8px', background: 'rgba(128, 128, 128, 0.1)', color: 'var(--text-heading)', fontWeight: 600, cursor: promoCodeInput.trim() ? 'pointer' : 'not-allowed' }}
                   >
                     {promoLoading ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                   </button>
                 </div>
                 {promoMessage.text && (
                   <div style={{ fontSize: '0.85rem', color: promoMessage.type === 'error' ? '#ef4444' : '#10b981', textAlign: 'left' }}>
                     {promoMessage.text}
                   </div>
                 )}
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input 
                       type="checkbox" 
                       id="autorenew" 
                       checked={autorenew} 
                       onChange={(e) => setAutorenew(e.target.checked)} 
                       style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="autorenew" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Enable Auto-Renew (AutoPay)</label>
                 </div>

                 <button 
                    onClick={handleRazorpayCheckout}
                    disabled={loading}
                    className={styles.upgradeBtn} 
                    style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}
                 >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                    {loading ? 'Processing...' : 'Upgrade Now'}
                 </button>
               </div>
            )}
          </div>

          {/* Elite Plan */}
          <div className={styles.card} style={{ opacity: 0.6, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 600 }}>Coming Soon</div>
            <h3 className={styles.planName}>Elite AI</h3>
            <div className={styles.price} style={{ fontSize: '2rem' }}>
              (Upcoming)
            </div>
            <div className={styles.billedYearly} style={{ visibility: 'hidden' }}>Placeholder</div>
            <p className={styles.description}>Replace manual replies with an intelligent AI clone.</p>
            <ul className={styles.features}>
              <li>Unlimited Connected Accounts</li>
              <li>Everything in Pro</li>
              <li>Unlimited DMs</li>
              <li>Creator Marketplace <span style={{fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '4px', fontWeight: 600}}>INCLUDED</span></li>
              <li>Intelligent AI Responses</li>
              <li>Custom Knowledge Base</li>
              <li>Human-Review Fallback</li>
            </ul>
            <button className={styles.primaryBtn} disabled style={{ opacity: 0.6 }}>Coming Soon</button>
          </div>
        </div>

        <section className={styles.comparisonSection}>
          <h2 className={styles.comparisonTitle}>Compare Plans</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Free Starter</th>
                  <th>Growth Pro</th>
                  <th>Elite AI</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.featureRow}>
                  <td colSpan={4} className={styles.featureCategory}>Core Automations</td>
                </tr>
                <tr>
                  <td>Active Automations</td>
                  <td>1</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Posts per Automation</td>
                  <td>1 Post</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Connected IG Accounts</td>
                  <td>1 Account</td>
                  <td>Up to 3 Accounts</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Monthly DMs & Comments</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Post & Reel Comments</td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
                <tr>
                  <td>DM Keyword Automation</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
                <tr>
                  <td>Story Replies</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>

                <tr className={styles.featureRow}>
                  <td colSpan={4} className={styles.featureCategory}>Lead Generation & Features</td>
                </tr>
                <tr>
                  <td>Creator Marketplace</td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INCLUDED</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INCLUDED</span></td>
                  <td><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>INCLUDED</span></td>
                </tr>
                <tr>
                  <td>Lead Capture (Email/Phone)</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
                <tr>
                  <td>Follow-Gate Verification</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
                <tr className={styles.featureRow}>
                  <td colSpan={4} className={styles.featureCategory}>AI Capabilities</td>
                </tr>
                <tr>
                  <td>Keyword Triggers (Text &amp; Emoji)</td>
                  <td>1 keyword set</td>
                  <td>Unlimited sets</td>
                  <td>Semantic AI Match</td>
                </tr>
                <tr>
                  <td>Auto AI Responses</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
                <tr>
                  <td>Knowledge Base integration</td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                  <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <AnimatePresence>
          {showTest3MModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}
              onClick={() => setShowTest3MModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ 
                  background: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  maxWidth: '420px', 
                  width: '100%', 
                  position: 'relative', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#fafafa', letterSpacing: '-0.025em' }}>
                  Promo Code Applied
                </h3>
                
                <p style={{ color: '#a1a1aa', marginBottom: '24px', fontSize: '0.875rem', lineHeight: 1.4 }}>
                  The code "TEST3M" has been successfully redeemed. Your account will not be charged for the first 30 days of your Pro subscription.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowTest3MModal(false)}
                    style={{ 
                      background: '#fafafa', 
                      color: '#18181b', 
                      border: 'none', 
                      padding: '0 16px', 
                      height: '40px',
                      borderRadius: '6px', 
                      fontSize: '0.875rem', 
                      fontWeight: 500, 
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#e4e4e7'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fafafa'}
                  >
                    Got it
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAQ SECTION */}
      <section style={{ width: '100%', background: 'transparent', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem', color: 'var(--text-heading)' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
               { q: 'Is my Instagram account safe using AutoDrop?', a: '100% yes. We use the official Meta Instagram Graph API. We never ask for your password, and our platform is fully compliant with Instagram’s terms of service, meaning zero risk of shadowbans.' },
               { q: 'If I upgrade to Growth Pro, how soon does it activate?', a: 'Instantly. As soon as your payment is confirmed, your account limits are removed and you can immediately create unlimited automations and use Lead Capture / Follow-Gate features.' },
               { q: 'Do I need any technical skills to set this up?', a: 'Not at all. We designed AutoDrop to be as simple as setting up an Instagram profile. If you get stuck, Growth Pro users get priority access to our support team for 1-on-1 help.' }
            ].map((faq, idx) => (
               <details key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '12px' }}>
                  <summary style={{ fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-heading)' }}>
                     {faq.q}
                     <span style={{ opacity: 0.5 }}>▾</span>
                  </summary>
                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{faq.a}</p>
               </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </div>
  );
}
