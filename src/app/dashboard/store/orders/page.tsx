"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, Loader2, ArrowLeft, ArrowUpDown 
} from "lucide-react";
import Link from "next/link";
import styles from "../store.module.css";

interface ProductMetadata {
  name: string;
  cover_image_url: string | null;
}

interface Order {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_name: string;
  buyer_email: string;
  amount: number;
  commission_amount: number;
  currency: string;
  payment_status: 'paid' | 'pending';
  payment_id: string | null;
  created_at: string;
  products: ProductMetadata | ProductMetadata[] | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/store/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e: any) {
      console.error("Failed to fetch orders:", e);
      setError(e.message || "Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sym = (c: string) => CURRENCY_SYMBOLS[c] || c;

  // Stats calculation
  const totalOrders = orders.length;
  const grossRevenue = orders.reduce((sum, o) => sum + (o.payment_status === "paid" ? o.amount : 0), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (o.payment_status === "paid" ? o.commission_amount : 0), 0);
  const netEarnings = grossRevenue - totalCommission;

  if (loading) {
    return (
      <div className={styles.storePage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={32} color="#6366f1" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.storePage}>
      {/* Header */}
      <div className={styles.storeHeader}>
        <div>
          <h1 className={styles.storeTitle}>Digital Store 🏪</h1>
          <p className={styles.storeSubtitle}>Track your sales history, buyer details, and commissions</p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className={styles.tabsNav}>
        <Link href="/dashboard/store" className={styles.tabLink}>
          <Package size={16} className={styles.tabIcon} />
          Products
        </Link>
        <Link href="/dashboard/store/orders" className={`${styles.tabLink} ${styles.activeTabLink}`}>
          <ShoppingCart size={16} className={styles.tabIcon} />
          Orders
        </Link>
        <Link href="/dashboard/store/payout" className={styles.tabLink}>
          <DollarSign size={16} className={styles.tabIcon} />
          Payouts
        </Link>
      </div>

      {error ? (
        <div style={{ padding: '2rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#fca5a5' }}>
          <p>{error}</p>
          <button onClick={() => { setLoading(true); fetchOrders(); }} style={{ marginTop: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.15)' }}>
                <ShoppingCart size={20} color="#6366f1" />
              </div>
              <div>
                <div className={styles.statLabel}>Total Orders</div>
                <div className={styles.statValue}>{totalOrders}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)' }}>
                <DollarSign size={20} color="#10b981" />
              </div>
              <div>
                <div className={styles.statLabel}>Gross Sales</div>
                <div className={styles.statValue}>₹{grossRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(239,68,68,0.15)' }}>
                <TrendingUp size={20} color="#ef4444" />
              </div>
              <div>
                <div className={styles.statLabel}>Commission Paid</div>
                <div className={styles.statValue}>₹{totalCommission.toLocaleString()}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.15)' }}>
                <DollarSign size={20} color="#8b5cf6" />
              </div>
              <div>
                <div className={styles.statLabel}>Net Revenue</div>
                <div className={styles.statValue}>₹{netEarnings.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Orders History Card */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Recent Transactions History</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Updated in real-time
              </span>
            </div>

            <div className={styles.tableWrapper}>
              {orders.length === 0 ? (
                <div className={styles.noOrders}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛍️</div>
                  <h3>No orders yet</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    When customers buy your digital products, they will appear here.
                  </p>
                </div>
              ) : (
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Buyer Details</th>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Gross Price</th>
                      <th>Commission</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {orders.map((order) => {
                        const product = Array.isArray(order.products) ? order.products[0] : order.products;
                        const productName = product?.name || "Deleted Product";
                        const coverImageUrl = product?.cover_image_url || null;

                        return (
                          <motion.tr 
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td>
                              <div className={styles.productCell}>
                                {coverImageUrl ? (
                                  <img 
                                    src={coverImageUrl} 
                                    alt={productName} 
                                    className={styles.productThumb} 
                                  />
                                ) : (
                                  <div className={styles.productThumbPlaceholder}>
                                    <Package size={16} />
                                  </div>
                                )}
                                <span style={{ fontWeight: 600 }}>{productName}</span>
                              </div>
                            </td>
                            <td>
                              <div className={styles.buyerCell}>
                                <span className={styles.buyerName}>{order.buyer_name}</span>
                                <span className={styles.buyerEmail}>{order.buyer_email}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                {order.id.slice(0, 8)}...
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.85rem' }}>
                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#10b981' }}>
                                {sym(order.currency)}{order.amount.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: '#ef4444' }}>
                                {sym(order.currency)}{order.commission_amount.toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${order.payment_status === "paid" ? styles.badgePaid : styles.badgePending}`}>
                                {order.payment_status === "paid" ? "Paid" : "Pending"}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
