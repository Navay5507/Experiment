"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AutomationRow } from "@/types/database";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  async function fetchAutomations() {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      setAutomations(data.automations ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    fetchAutomations();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this automation?")) return;
    await fetch("/api/automations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAutomations();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your keyword-triggered comment and DM automations.
          </p>
        </div>
        <a href="/automations/new">
          <Button>New Automation</Button>
        </a>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : automations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold">No automations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first automation to start replying to comments and sending DMs automatically.
          </p>
          <a href="/automations/new">
            <Button className="mt-4">Create Automation</Button>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((auto) => (
            <div key={auto.id} className="rounded-lg border p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {auto.target_type === "post" ? "Post" : auto.target_type === "story" ? "Story" : "Live"}{" "}
                      Automation
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        auto.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {auto.is_active ? "Active" : "Inactive"}
                    </span>
                    {auto.gate_type !== "none" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {auto.gate_type === "follow" ? "Follow-Gate" : "Lead Capture"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keywords: {auto.keywords.map((k) => `"${k}"`).join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reply: {auto.comment_reply_template.substring(0, 80)}
                    {auto.comment_reply_template.length > 80 ? "..." : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rate: {auto.rate_limit_per_hour}/hour · Created{" "}
                    {new Date(auto.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(auto.id, auto.is_active)}
                  >
                    {auto.is_active ? "Pause" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(auto.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
