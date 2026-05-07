"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { GateType, LeadType, TargetType } from "@/types/database";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function NewAutomationPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Target type & post selection
  const [targetType, setTargetType] = useState<TargetType>("post");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  // Step 2 — Keywords
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  // Step 3 — Comment reply template
  const [replyTemplate, setReplyTemplate] = useState("Hey {{name}}! Check your DMs 🎉");

  // Step 4 — DM configuration
  const [dmMessage, setDmMessage] = useState("Here is the link you requested!");
  const [dmLink, setDmLink] = useState("");
  const [gateType, setGateType] = useState<GateType>("none");
  const [leadType, setLeadType] = useState<LeadType>("email");

  // Step 5 — Rate limit
  const [rateLimit, setRateLimit] = useState(20);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/instagram/posts");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setError("Failed to load posts. Make sure your Instagram account is connected.");
    } finally {
      setLoadingPosts(false);
    }
  }

  function addKeyword() {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setKeywords(keywords.filter((k) => k !== kw));
  }

  async function handleSubmit() {
    if (!selectedPost) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram_account_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", // dev account
          post_id: selectedPost.id,
          post_url: selectedPost.permalink,
          target_type: targetType,
          keywords,
          comment_reply_template: replyTemplate,
          dm_message: dmMessage,
          dm_link: dmLink || null,
          gate_type: gateType,
          lead_type: gateType === "lead" ? leadType : null,
          rate_limit_per_hour: rateLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create automation");
        setSubmitting(false);
        return;
      }

      router.push("/automations");
    } catch {
      setError("Failed to create automation");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Automation</h1>
        <p className="mt-1 text-muted-foreground">
          Step {step} of 6 — {
            step === 1 ? "Select Post" :
            step === 2 ? "Set Keywords" :
            step === 3 ? "Comment Reply" :
            step === 4 ? "Configure DM" :
            step === 5 ? "Rate Limit" :
            "Review & Activate"
          }
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {([1, 2, 3, 4, 5, 6] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Step 1: Select Target & Post */}
      {step === 1 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium">Target Type</label>
            <div className="mt-2 flex gap-2">
              {(["post", "story", "live"] as TargetType[]).map((t) => (
                <button
                  key={t}
                  className={`rounded-md border px-4 py-2 text-sm capitalize ${
                    targetType === t ? "border-primary bg-primary/10 font-medium" : ""
                  }`}
                  onClick={() => setTargetType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={loadPosts} disabled={loadingPosts}>
              {loadingPosts ? "Loading..." : "Load My Posts"}
            </Button>
          </div>

          {posts.length > 0 && (
            <div className="grid gap-3">
              {posts.map((post) => (
                <button
                  key={post.id}
                  className={`rounded-md border p-3 text-left ${
                    selectedPost?.id === post.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  <p className="text-sm font-medium">
                    {post.caption?.substring(0, 100) ?? "No caption"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.media_type} · {new Date(post.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}

          <Button
            disabled={!selectedPost}
            onClick={() => setStep(2)}
            className="w-full"
          >
            Next: Set Keywords
          </Button>
        </div>
      )}

      {/* Step 2: Keywords */}
      {step === 2 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium">Trigger Keywords</label>
            <p className="text-xs text-muted-foreground">
              When a comment contains any of these keywords, the automation fires.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                placeholder='e.g. "link", "info", "price"'
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              />
              <Button variant="outline" onClick={addKeyword}>Add</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                >
                  {kw}
                  <button className="text-xs hover:text-red-500" onClick={() => removeKeyword(kw)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={keywords.length === 0} onClick={() => setStep(3)} className="flex-1">
              Next: Comment Reply
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Comment Reply Template */}
      {step === 3 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium">Comment Reply Template</label>
            <p className="text-xs text-muted-foreground">
              Use {"{{name}}"} to insert the commenter&apos;s username.
            </p>
            <textarea
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              value={replyTemplate}
              onChange={(e) => setReplyTemplate(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Preview: {replyTemplate.replace("{{name}}", "@example_user")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button disabled={!replyTemplate} onClick={() => setStep(4)} className="flex-1">
              Next: Configure DM
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: DM Configuration */}
      {step === 4 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium">DM Message</label>
            <textarea
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              rows={2}
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">DM Link</label>
            <input
              type="url"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="https://example.com/resource"
              value={dmLink}
              onChange={(e) => setDmLink(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gate Type</label>
            <div className="mt-2 flex gap-2">
              {(["none", "follow", "lead"] as GateType[]).map((g) => (
                <button
                  key={g}
                  className={`rounded-md border px-4 py-2 text-sm capitalize ${
                    gateType === g ? "border-primary bg-primary/10 font-medium" : ""
                  }`}
                  onClick={() => setGateType(g)}
                >
                  {g === "none" ? "No Gate" : g === "follow" ? "Follow-Gate" : "Lead Capture"}
                </button>
              ))}
            </div>
          </div>

          {gateType === "lead" && (
            <div>
              <label className="text-sm font-medium">Capture Type</label>
              <div className="mt-2 flex gap-2">
                {(["email", "phone"] as LeadType[]).map((lt) => (
                  <button
                    key={lt}
                    className={`rounded-md border px-4 py-2 text-sm capitalize ${
                      leadType === lt ? "border-primary bg-primary/10 font-medium" : ""
                    }`}
                    onClick={() => setLeadType(lt)}
                  >
                    {lt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={() => setStep(5)} className="flex-1">
              Next: Rate Limit
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Rate Limit */}
      {step === 5 && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium">Rate Limit (per hour)</label>
            <p className="text-xs text-muted-foreground">
              Max replies and DMs per hour. Default 20. Lower is safer.
            </p>
            <input
              type="number"
              className="mt-2 w-32 rounded-md border px-3 py-2 text-sm"
              min={1}
              max={60}
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
            <Button onClick={() => setStep(6)} className="flex-1">
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Review & Activate */}
      {step === 6 && (
        <div className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Review Your Automation</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Target</span>
              <span className="capitalize">{targetType}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Post</span>
              <span className="max-w-[300px] truncate">
                {selectedPost?.caption?.substring(0, 50) ?? selectedPost?.id}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Keywords</span>
              <span>{keywords.join(", ")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Reply</span>
              <span className="max-w-[300px] truncate">{replyTemplate}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">DM Link</span>
              <span className="max-w-[300px] truncate">{dmLink || "None"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Gate</span>
              <span className="capitalize">
                {gateType === "none" ? "None" : gateType === "follow" ? "Follow-Gate" : `Lead (${leadType})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate Limit</span>
              <span>{rateLimit}/hour</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(5)}>Back</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? "Creating..." : "Activate Automation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
