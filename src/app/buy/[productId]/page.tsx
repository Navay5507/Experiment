"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Script from "next/script";
import { ShieldCheck, ExternalLink, Package, Loader2 } from "lucide-react";
import styles from "../checkout.module.css";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  product_type: string;
  cover_image_url: string | null;
  seller_name: string;
  seller_handle: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£",
};

export default function CheckoutPage() {
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryContent, setDeliveryContent] = useState("");
  const [deliveryType, setDeliveryType] = useState("");

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/store/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => setProduct(data.product))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleFreeDownload = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/store/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
        }),
      });
      const data = await res.json();
      if (data.is_free) {
        setDeliveryContent(data.delivery_content);
        setDeliveryType(data.delivery_type);
        setSuccess(true);
      }
    } catch (e) {
      console.error("Download error:", e);
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/store/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
        }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: product?.seller_name || "Creator",
        description: product?.name || "Digital Product",
        order_id: data.razorpay_order_id,
        prefill: {
          email: buyerEmail,
          name: buyerName,
        },
        theme: { color: "#6366f1" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyRes = await fetch("/api/store/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: data.order_id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setDeliveryContent(verifyData.delivery_content);
              setDeliveryType(verifyData.delivery_type);
              setSuccess(true);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch {
            alert("Payment verification error. Please contact support.");
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Purchase error:", e);
      alert("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const sym = (c: string) => CURRENCY_SYMBOLS[c] || c;

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={32} />
        </motion.div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className={styles.checkoutPage}>
        <div className={styles.checkoutCard}>
          <div className={styles.notFound}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Product not found</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>This product may have been removed or the link is invalid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className={styles.checkoutPage}>
        <motion.div
          className={styles.checkoutCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Cover */}
          {product.cover_image_url ? (
            <img src={product.cover_image_url} alt={product.name} className={styles.coverImage} />
          ) : (
            <div className={styles.coverPlaceholder}>
              <Package size={48} color="rgba(99,102,241,0.5)" />
            </div>
          )}

          <div className={styles.cardBody}>
            {success ? (
              /* Success State */
              <div className={styles.successState}>
                <div className={styles.successIcon}>🎉</div>
                <h2 className={styles.successTitle}>
                  {product.price === 0 ? "Download Ready!" : "Payment Successful!"}
                </h2>
                <p className={styles.successText}>
                  {deliveryType === "dm_message"
                    ? "Your content has been delivered. Check below:"
                    : "Your product is ready. Click below to access it:"}
                </p>

                {deliveryType === "dm_message" ? (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '12px',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    textAlign: 'left'
                  }}>
                    {deliveryContent}
                  </div>
                ) : deliveryContent ? (
                  <a href={deliveryContent} target="_blank" rel="noopener noreferrer" className={styles.deliveryLink}>
                    <ExternalLink size={16} />
                    {deliveryType === "file" ? "Download File" : "Access Product"}
                  </a>
                ) : null}
              </div>
            ) : (
              /* Checkout Form */
              <>
                <div className={styles.sellerRow}>
                  {product.seller_handle && (
                    <>
                      <span>by</span>
                      <strong style={{ color: '#fff' }}>@{product.seller_handle}</strong>
                    </>
                  )}
                </div>

                <h1 className={styles.productTitle}>{product.name}</h1>
                {product.description && (
                  <p className={styles.productDescription}>{product.description}</p>
                )}

                <div className={styles.priceTag}>
                  {product.price === 0 ? "Free" : `${sym(product.currency)}${product.price.toLocaleString()}`}
                </div>

                <div className={styles.divider} />

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Name</label>
                  <input
                    className={styles.formInput}
                    placeholder="Enter your name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="your@email.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                </div>

                {product.price === 0 ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={styles.freeBtn}
                    onClick={handleFreeDownload}
                    disabled={processing}
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : null}
                    {processing ? "Processing..." : "Get It Free →"}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={styles.buyBtn}
                    onClick={handlePurchase}
                    disabled={processing}
                  >
                    {processing ? <Loader2 size={18} className="animate-spin" /> : null}
                    {processing ? "Processing..." : `Pay ${sym(product.currency)}${product.price.toLocaleString()} →`}
                  </motion.button>
                )}

                <div className={styles.secureNote}>
                  <ShieldCheck size={12} />
                  <span>Secure payment powered by Razorpay</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.poweredBy}>
            Powered by <a href="https://autodrop.in" target="_blank" rel="noopener noreferrer">AutoDrop</a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
