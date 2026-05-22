"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Package, DollarSign, ShoppingCart, TrendingUp,
  Copy, Pencil, Trash2, ExternalLink, X, Check, Link2, FileText, MessageSquare, UploadCloud, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import styles from "./store.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  product_type: string;
  delivery_type: string;
  delivery_content: string;
  cover_image_url: string | null;
  is_active: boolean;
  total_sales: number;
  total_revenue: number;
  created_at: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£",
};

const DELIVERY_ICONS: Record<string, typeof Link2> = {
  link: Link2, file: FileText, file_upload: UploadCloud, dm_message: MessageSquare,
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", description: "", price: "0", currency: "INR",
    product_type: "digital", delivery_type: "link", delivery_content: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/store/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error("Failed to fetch products:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreateModal = () => {
    setEditProduct(null);
    setForm({ name: "", description: "", price: "0", currency: "INR", product_type: "digital", delivery_type: "link", delivery_content: "" });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      currency: product.currency || "INR",
      product_type: product.product_type || "digital",
      delivery_type: product.delivery_type || "link",
      delivery_content: product.delivery_content || "",
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    
    // Validate file upload if selected
    if (form.delivery_type === "file_upload" && !selectedFile && !editProduct?.delivery_content) {
      alert("Please select a file to upload.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ...form,
        price: parseFloat(form.price) || 0,
      };

      // Handle native file upload to Supabase Storage
      if (form.delivery_type === "file_upload" && selectedFile) {
        setUploading(true);
        const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { data, error } = await supabase.storage
          .from('products')
          .upload(`uploads/${fileName}`, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          alert(`File upload failed: ${error.message}. Please ensure you have created a public bucket named 'products' in Supabase Storage.`);
          setSaving(false);
          setUploading(false);
          return;
        }
        
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
        payload.delivery_content = urlData.publicUrl;
        setUploading(false);
      }

      const url = editProduct
        ? `/api/store/products/${editProduct.id}`
        : "/api/store/products";
      const method = editProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await fetch(`/api/store/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      await fetch(`/api/store/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      fetchProducts();
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  const copyCheckoutLink = (id: string) => {
    const url = `${window.location.origin}/buy/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats
  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + (p.total_sales || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
  const activeProducts = products.filter(p => p.is_active).length;

  const sym = (c: string) => CURRENCY_SYMBOLS[c] || c;

  if (loading) {
    return (
      <div className={styles.storePage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Package size={32} color="#6366f1" />
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
          <p className={styles.storeSubtitle}>Sell digital products, presets, courses & more — delivered via DM</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.createBtn}
          onClick={openCreateModal}
        >
          <Plus size={18} /> Create Product
        </motion.button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className={styles.tabsNav}>
        <Link href="/dashboard/store" className={`${styles.tabLink} ${styles.activeTabLink}`}>
          <Package size={16} className={styles.tabIcon} />
          Products
        </Link>
        <Link href="/dashboard/store/orders" className={styles.tabLink}>
          <ShoppingCart size={16} className={styles.tabIcon} />
          Orders
        </Link>
        <Link href="/dashboard/store/payout" className={styles.tabLink}>
          <DollarSign size={16} className={styles.tabIcon} />
          Payouts
        </Link>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Package size={20} color="#6366f1" />
          </div>
          <div>
            <div className={styles.statLabel}>Products</div>
            <div className={styles.statValue}>{totalProducts}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)' }}>
            <DollarSign size={20} color="#10b981" />
          </div>
          <div>
            <div className={styles.statLabel}>Revenue</div>
            <div className={styles.statValue}>₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(234,179,8,0.15)' }}>
            <ShoppingCart size={20} color="#eab308" />
          </div>
          <div>
            <div className={styles.statLabel}>Total Sales</div>
            <div className={styles.statValue}>{totalSales}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(139,92,246,0.15)' }}>
            <TrendingUp size={20} color="#8b5cf6" />
          </div>
          <div>
            <div className={styles.statLabel}>Active</div>
            <div className={styles.statValue}>{activeProducts}</div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3 className={styles.emptyTitle}>No products yet</h3>
          <p className={styles.emptyText}>
            Create your first digital product and start earning. Sell e-books, presets, templates, courses — anything digital.
          </p>
          <motion.button whileTap={{ scale: 0.97 }} className={styles.createBtn} onClick={openCreateModal}>
            <Plus size={18} /> Create Your First Product
          </motion.button>
        </div>
      ) : (
        <div className={styles.productGrid}>
          <AnimatePresence>
            {products.map((product) => {
              const DeliveryIcon = DELIVERY_ICONS[product.delivery_type] || Link2;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={styles.productCard}
                >
                  {product.cover_image_url ? (
                    <img src={product.cover_image_url} alt={product.name} className={styles.productCover} />
                  ) : (
                    <div className={styles.productCoverPlaceholder}>
                      <DeliveryIcon size={40} color="rgba(99,102,241,0.4)" />
                    </div>
                  )}

                  <div className={styles.productBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={`${styles.badge} ${product.is_active ? styles.badgeActive : styles.badgeInactive}`}
                            onClick={() => handleToggle(product)}
                            style={{ cursor: 'pointer' }}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {product.description && <p className={styles.productDesc}>{product.description}</p>}

                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>
                        {product.price === 0 ? "Free" : `${sym(product.currency)}${product.price.toLocaleString()}`}
                      </span>
                      <span className={styles.productSales}>
                        <ShoppingCart size={12} /> {product.total_sales || 0} sales
                      </span>
                    </div>
                  </div>

                  <div className={styles.productActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.copyBtn}`}
                      onClick={() => copyCheckoutLink(product.id)}
                    >
                      {copiedId === product.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Link</>}
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => openEditModal(product)}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.modalTitle}>
                  {editProduct ? "Edit Product" : "Create Product"} ✨
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                  <X size={20} color="#9ca3af" />
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Name</label>
                <input
                  className={styles.formInput}
                  placeholder="e.g., Lightroom Preset Pack"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={`${styles.formInput}`}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  placeholder="Describe your product..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Price</label>
                <div className={styles.priceRow}>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="0"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                  <select
                    className={styles.formSelect}
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
                {form.price === "0" && (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                    💡 Free products are delivered instantly without payment
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Delivery Method</label>
                <select
                  className={styles.formSelect}
                  value={form.delivery_type}
                  onChange={(e) => setForm({ ...form, delivery_type: e.target.value })}
                >
                  <option value="link">🔗 Link (External URL)</option>
                  <option value="file_upload">⬆️ Upload Media / File (Native)</option>
                  <option value="file">📁 Link to File (Google Drive / Dropbox)</option>
                  <option value="dm_message">💬 DM Message (Custom Text)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {form.delivery_type === "link" ? "Product URL" :
                   form.delivery_type === "file" ? "File Download Link" : 
                   form.delivery_type === "file_upload" ? "Upload Product File" : "DM Message Content"}
                </label>
                {form.delivery_type === "dm_message" ? (
                  <textarea
                    className={`${styles.formInput}`}
                    style={{ resize: 'vertical', minHeight: '80px' }}
                    placeholder="The message that will be sent as DM after purchase..."
                    value={form.delivery_content}
                    onChange={(e) => setForm({ ...form, delivery_content: e.target.value })}
                  />
                ) : form.delivery_type === "file_upload" ? (
                  <div style={{ padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <input 
                      type="file" 
                      id="product-file-upload" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          // Clear the text content so it gets overwritten by the new URL later
                          setForm({ ...form, delivery_content: "Will be generated upon upload" });
                        }
                      }}
                    />
                    <label htmlFor="product-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <UploadCloud size={32} color="var(--primary)" />
                      {selectedFile ? (
                        <div style={{ color: '#fff', fontWeight: 600 }}>{selectedFile.name}</div>
                      ) : editProduct && editProduct.delivery_content && editProduct.delivery_type === "file_upload" ? (
                        <div style={{ color: '#fff', fontWeight: 600 }}>Current File Uploaded (Click to replace)</div>
                      ) : (
                        <div style={{ color: '#fff', fontWeight: 600 }}>Click to select a file</div>
                      )}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Supports PDFs, ZIPs, Videos, Images, etc.
                      </div>
                    </label>
                  </div>
                ) : (
                  <input
                    className={styles.formInput}
                    placeholder={form.delivery_type === "link" ? "https://your-product-link.com" : "https://drive.google.com/..."}
                    value={form.delivery_content}
                    onChange={(e) => setForm({ ...form, delivery_content: e.target.value })}
                  />
                )}
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button className={styles.submitBtn} onClick={handleSave} disabled={saving || !form.name.trim()}>
                  {uploading ? <><Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} /> Uploading File...</> : 
                   saving ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
