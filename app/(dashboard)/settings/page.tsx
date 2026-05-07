"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { InstagramAccountRow } from "@/types/database";

const DEV_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<InstagramAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "connected") setSuccess("Instagram account connected!");
    if (params.get("error")) setError(params.get("error"));
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch(`/api/instagram/accounts?user_id=${DEV_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts ?? []);
      }
    } catch {
      // Account fetch failed silently — may not have API route yet
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect(accountId: string) {
    try {
      await fetch(`/api/instagram/accounts?id=${accountId}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      setSuccess("Account disconnected.");
    } catch {
      setError("Failed to disconnect account.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your Instagram connection and account preferences.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Instagram Connection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your Instagram Business or Creator account to start automating.
        </p>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium">@{account.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Connected{" "}
                      {new Date(account.connected_at).toLocaleDateString()}
                    </p>
                    {account.token_expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Token expires:{" "}
                        {new Date(account.token_expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                No Instagram account connected yet.
              </p>
              <a href="/api/instagram/connect">
                <Button>Connect Instagram Account</Button>
              </a>
            </div>
          )}

          {accounts.length > 0 && (
            <div className="mt-4">
              <a href="/api/instagram/connect">
                <Button variant="outline">Connect Another Account</Button>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Account</h2>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="font-mono text-sm">{DEV_USER_ID}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <p className="text-sm">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                Pro (Dev)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
