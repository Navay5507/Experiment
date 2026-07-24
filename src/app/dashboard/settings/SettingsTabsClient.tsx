"use client";

import { useState } from "react";
import { Link2, CreditCard, Activity, AlertTriangle } from "lucide-react";

interface SettingsTabsClientProps {
  connectionsPanel: React.ReactNode;
  subscriptionPanel: React.ReactNode;
  maintenancePanel: React.ReactNode;
  dangerPanel: React.ReactNode;
}

export default function SettingsTabsClient({
  connectionsPanel,
  subscriptionPanel,
  maintenancePanel,
  dangerPanel
}: SettingsTabsClientProps) {
  const [activeTab, setActiveTab] = useState('connections');

  const tabs = [
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance & Diagnostics', icon: Activity },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.4rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        maxWidth: '100%',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                border: '1px solid',
                borderColor: isSelected ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
                color: isSelected ? '#c084fc' : 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'connections' && connectionsPanel}
        {activeTab === 'subscription' && subscriptionPanel}
        {activeTab === 'maintenance' && maintenancePanel}
        {activeTab === 'danger' && dangerPanel}
      </div>
    </>
  );
}
