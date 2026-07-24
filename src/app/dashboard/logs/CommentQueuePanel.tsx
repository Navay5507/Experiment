'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, CheckCircle2, Clock, AlertTriangle, MessageCircle, X } from 'lucide-react';

interface PendingComment {
  id: string;
  created_at: string;
  metadata: {
    comment_id?: string;
    commenter_id?: string;
    commenter_username?: string;
    keyword?: string;
    media_id?: string;
    status?: string;
    // from automation match
    [key: string]: any;
  };
}

export default function CommentQueuePanel() {
  const [pending, setPending] = useState<PendingComment[]>([]);
  const [completed, setCompleted] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/queue/pending-comments');
      if (res.ok) {
        const data = await res.json();
        setPending(data.pending || []);
        setCompleted(data.completed || []);
      }
    } catch (e) {
      console.error('Failed to fetch comment queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRetry = async (comment: PendingComment) => {
    const commentId = comment.metadata?.comment_id || comment.id;
    if (!commentId) return;

    setRetrying(commentId);
    try {
      const res = await fetch('/api/queue/retry-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          automationId: comment.metadata?.automation_id,
          recipientId: comment.metadata?.commenter_id,
          commenterUsername: comment.metadata?.commenter_username || '',
        }),
      });
      if (res.ok) {
        // Move from pending to show as retried
        setPending(prev => prev.map(p =>
          (p.metadata?.comment_id || p.id) === commentId
            ? { ...p, metadata: { ...p.metadata, status: 'retrying' } }
            : p
        ));
      }
    } catch (e) {
      console.error('Retry failed', e);
    } finally {
      setRetrying(null);
    }
  };

  const handleDismiss = async (comment: PendingComment) => {
    const commentId = comment.metadata?.comment_id || comment.id;
    if (!commentId) return;

    setDismissing(commentId);
    try {
      const res = await fetch('/api/queue/dismiss-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
      if (res.ok) {
        setPending(prev => prev.filter(p => (p.metadata?.comment_id || p.id) !== commentId));
      }
    } catch (e) {
      console.error('Dismiss failed', e);
    } finally {
      setDismissing(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'failed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={12} /> Failed
          </span>
        );
      case 'retrying':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <RotateCcw size={12} /> Retrying…
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Comment Queue</h2>
          {pending.length > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '10px', minWidth: '20px', textAlign: 'center' }}>
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', background: 'rgba(128,128,128,0.08)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', background: 'rgba(128,128,128,0.06)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setTab('pending')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: tab === 'pending' ? 'var(--primary)' : 'transparent', color: tab === 'pending' ? '#fff' : 'var(--text-muted)' }}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: tab === 'completed' ? 'var(--primary)' : 'transparent', color: tab === 'completed' ? '#fff' : 'var(--text-muted)' }}
        >
          Replied ({completed.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading queue…</div>
      ) : tab === 'pending' ? (
        pending.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
            <CheckCircle2 size={28} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#10b981' }}>All caught up!</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>No pending comments in the last 7 days.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pending.map(comment => {
              const cid = comment.metadata?.comment_id || comment.id;
              return (
                <div key={cid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      {getStatusBadge(comment.metadata?.status)}
                      {comment.metadata?.keyword && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          Keyword: {comment.metadata.keyword}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(comment.created_at).toLocaleString()} · Instagram Comment
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDismiss(comment)}
                      disabled={dismissing === cid || retrying === cid}
                      title="Dismiss this comment"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.45rem', borderRadius: '8px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', background: 'rgba(128,128,128,0.1)', transition: 'all 0.2s', opacity: dismissing === cid ? 0.6 : 1 }}
                    >
                      <X size={16} style={{ animation: dismissing === cid ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    <button
                      onClick={() => handleRetry(comment)}
                      disabled={retrying === cid || comment.metadata?.status === 'retrying'}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: comment.metadata?.status === 'retrying' ? 'not-allowed' : 'pointer', color: '#fff', background: comment.metadata?.status === 'retrying' ? 'rgba(245,158,11,0.5)' : 'var(--primary)', transition: 'all 0.2s', opacity: retrying === cid ? 0.6 : 1, whiteSpace: 'nowrap' }}
                    >
                      <RotateCcw size={13} style={{ animation: retrying === cid ? 'spin 1s linear infinite' : 'none' }} />
                      {comment.metadata?.status === 'retrying' ? 'Queued' : 'Retry'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        completed.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No replied comments in the last 7 days.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {completed.slice(0, 20).map(comment => {
              const cid = comment.metadata?.comment_id || comment.id;
              return (
                <div key={cid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <CheckCircle2 size={12} /> Replied
                      </span>
                      {comment.metadata?.keyword && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {comment.metadata.keyword}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(comment.created_at).toLocaleString()} · Instagram Comment
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
