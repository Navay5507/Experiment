"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MessageCircle, Check, X, Minus, Loader2, ShieldCheck } from "lucide-react";
import styles from "./pricing.module.css";

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
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState<Currency>("INR");
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activePromo, setActivePromo] = useState<{code: string, type: string, value: number} | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });

  // Sync the plan status if possible
  useEffect(() => {
    const fetchStep = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const { data } = await res.json();
          if (data?.plan) setUserPlan(data.plan);
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
      // Don't calculate final discount here, backend does it, just pass base amount and promo
      const monthlyAmount = getPrice(rates[currency].pro, false); // pass false so we don't apply discount twice in the fetch payload
      const checkoutBaseAmount = isAnnual ? (monthlyAmount * 12) : monthlyAmount;
      
      const response = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: checkoutBaseAmount,
          currency,
          receipt: `rcpt_${Date.now()}`,
          promoCode: activePromo ? activePromo.code : undefined,
          billingCycle: isAnnual ? 'annual' : 'monthly',
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Server could not create Razorpay order.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AutoDROP",
        description: `Upgrade to Growth Pro (${isAnnual ? 'Annual' : 'Monthly'})`,
        image: "https://autodrop.framer.website/logo.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/billing/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
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
    USD: { pro: 7, elite: 99 },
    GBP: { pro: 6, elite: 79 },
    CAD: { pro: 10, elite: 135 },
    AUD: { pro: 11, elite: 149 },
    NZD: { pro: 12, elite: 164 },
    EUR: { pro: 7, elite: 89 },
    ZAR: { pro: 139, elite: 1880 },
    SGD: { pro: 10, elite: 133 },
    INR: { pro: 599, elite: 8200 },
    NGN: { pro: 9900, elite: 148500 },
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
    // Universal identical pricing parity based strictly on the India 599 -> 399 model (~33.39% discount)
    let price = isAnnual ? Math.round(baseTierPrice * (399 / 599)) : baseTierPrice;
    
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
    <main className={styles.pricingContainer} style={{ position: 'relative' }}>
      <button onClick={() => router.back()} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500, backdropFilter: 'blur(10px)' }}>
        ← Go Back
      </button>
      <div className={styles.blob} />
      <header className={styles.header}>
        <h1 className={styles.title}>Simple, transparent pricing</h1>
        <p className={styles.subtitle}>Unlock AutoDrop&apos;s full potential and convert your audience into revenue.</p>
      </header>

      <div className={styles.controlsRow}>
        
        {/* Billing Toggle */}
        <div className={styles.toggleWrapper}>
          <span className={`${styles.toggleLabel} ${!isAnnual ? styles.activeLabel : ''}`}>Monthly</span>
          <button 
            type="button" 
            className={`${styles.toggleBtn} ${isAnnual ? styles.toggled : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <div className={styles.toggleThumb} />
          </button>
          <span className={`${styles.toggleLabel} ${isAnnual ? styles.activeLabel : ''}`}>
            Annually <span className={styles.discountBadge}>-33%</span>
          </span>
        </div>

        {/* Currency Selector */}
        <div className={styles.currencyWrapper}>
          <label htmlFor="currency" className={styles.currencyLabel}>Currency:</label>
          <select 
            id="currency" 
            className={styles.currencySelect}
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as Currency)}
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
          <div className={styles.price}>{formatPrice(0)}<span className={styles.period}>/mo</span></div>
          <p className={styles.description}>Test the waters with basic comment replies.</p>
          <ul className={styles.features}>
            <li>1 Active Automation</li>
            <li>100 DMs / month</li>
            <li>Basic Analytics</li>
          </ul>
          <Link href="/dashboard" className={styles.primaryBtn}>Current Plan</Link>
        </div>

        {/* Pro Plan */}
        <div className={`${styles.card} ${styles.proCard}`}>
          <div className={styles.badge}>Most Popular</div>
          <h3 className={styles.planName}>Growth Pro</h3>
          <div className={styles.price}>
            {activePromo && (
              <span style={{ textDecoration: 'line-through', fontSize: '1.2rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                {formatPrice(getPrice(currentRate.pro, false))}
              </span>
            )}
            {formatPrice(getPrice(currentRate.pro))}
            <span className={styles.period}>/mo</span>
          </div>
          {isAnnual && <div className={styles.billedYearly}>Billed {formatPrice(getPrice(currentRate.pro) * 12)} yearly</div>}
          <p className={styles.description}>Full funnel automation to capture leads and scale.</p>
          <ul className={styles.features}>
            <li>Unlimited Automations</li>
            <li>Unlimited DMs</li>
            <li>Follow-Gate Links</li>
            <li>Lead Capture (Email/Phone)</li>
            <li>Custom Rate Limits</li>
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
                   style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white', textTransform: 'uppercase' }}
                 />
                 <button 
                   onClick={handleApplyPromo} 
                   disabled={promoLoading || !promoCodeInput.trim()}
                   style={{ padding: '0 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, cursor: promoCodeInput.trim() ? 'pointer' : 'not-allowed' }}
                 >
                   {promoLoading ? <Loader2 className="animate-spin" size={16} /> : 'Apply'}
                 </button>
               </div>
               {promoMessage.text && (
                 <div style={{ fontSize: '0.85rem', color: promoMessage.type === 'error' ? '#ef4444' : '#10b981', textAlign: 'left' }}>
                   {promoMessage.text}
                 </div>
               )}
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
            <li>Everything in Pro</li>
            <li>Unlimited DMs</li>
            <li>Gemini 3 AI Responses</li>
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
                <td>Monthly DMs</td>
                <td>100</td>
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
                <td>Story Replies</td>
                <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                <td><span className={styles.iconCheck}><Check size={20} /></span></td>
              </tr>

              <tr className={styles.featureRow}>
                <td colSpan={4} className={styles.featureCategory}>Lead Generation & Features</td>
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
              <tr>
                <td>Custom Rate Limits</td>
                <td><span className={styles.iconCross}><Minus size={20} /></span></td>
                <td><span className={styles.iconCheck}><Check size={20} /></span></td>
                <td><span className={styles.iconCheck}><Check size={20} /></span></td>
              </tr>
              
              <tr className={styles.featureRow}>
                <td colSpan={4} className={styles.featureCategory}>AI Capabilities</td>
              </tr>
              <tr>
                <td>Keyword Triggers</td>
                <td>Exact Match</td>
                <td>Exact & Fuzzy</td>
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

      {/* FAQ SECTION */}
      <section className={styles.faqSection} style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
             { q: 'Is my Instagram account safe using AutoDrop?', a: '100% yes. We use the official Meta Instagram Graph API. We never ask for your password, and our platform is fully compliant with Instagram’s terms of service, meaning zero risk of shadowbans.' },
             { q: 'What happens if I hit my limit on the Free plan?', a: 'If you exceed your 100 DM monthly limit on the Free plan, we will simply pause sending new DMs. We’ll notify you by email so you can upgrade to Pro to continue processing comments automatically.' },
             { q: 'If I upgrade to Growth Pro, how soon does it activate?', a: 'Instantly. As soon as your payment is confirmed, your account limits are removed and you can immediately create unlimited automations.' },
             { q: 'Do I need any technical skills to set this up?', a: 'Not at all. We designed AutoDrop to be as simple as setting up an Instagram profile. If you get stuck, Growth Pro users get priority access to our support team for 1-on-1 help.' }
          ].map((faq, idx) => (
             <details key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '12px' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   {faq.q}
                   <span style={{ opacity: 0.5 }}>▾</span>
                </summary>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{faq.a}</p>
             </details>
          ))}
        </div>
      </section>


      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0 1.5rem', background: 'var(--surface)', width: '100%', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          {/* Logo + Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 48, objectFit: 'contain' }} />
              <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>Instagram DM Automation, Simplified.</p>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link>
            <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Pricing</Link>
            <a href="mailto:support@autodrop.in" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Contact Us</a>
            <span style={{ opacity: 0.5 }}>Terms &amp; Privacy</span>
          </div>

          {/* Gradient Divider */}
          <div style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

          {/* Copyright + Small Text */}
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>
            <p>&copy; {new Date().getFullYear()} AutoDrop. All rights reserved.</p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
               <ShieldCheck size={14} color="#10b981" /> Official Meta Business Partner
            </p>
          </div>
        </div>

        {/* GIANT BACKGROUND WATERMARK */}
        <div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', marginTop: '2rem', pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontSize: 'min(24vw, 300px)', fontWeight: 900, lineHeight: 0.75, letterSpacing: '-0.06em', background: 'linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>
            AutoDrop
          </span>
        </div>
      </footer>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </main>
  );
}
