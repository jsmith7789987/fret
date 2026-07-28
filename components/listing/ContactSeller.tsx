"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export function ContactSeller({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function send() {
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-match-border bg-match-bg px-4 py-3 text-[13px] text-match-text">
        Message sent. The seller will reply to your email.
      </div>
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full py-2.5">
        Contact seller
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Hi, is this still available? I'm interested in..."
        className="w-full resize-none rounded-card border-[0.5px] border-hairline bg-white px-4 py-3 text-[14px] text-ink placeholder:text-muted/60 focus:border-ink"
      />
      {status === "error" && (
        <p className="text-[12px] text-match-text">
          Could not send. Please try again.
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button
          onClick={send}
          disabled={status === "sending" || !message.trim()}
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[13px] text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
