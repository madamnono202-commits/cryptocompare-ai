"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AutomationTriggerButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleTrigger() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/automation/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoPublish: false }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Article generated: "${data.title}"`,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Pipeline failed",
        });
      }
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleTrigger} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Bot className="mr-2 h-4 w-4" />
        )}
        {loading ? "Generating..." : "Generate Article"}
      </Button>
      {result && (
        <p
          className={`text-xs ${result.success ? "text-green-600" : "text-red-500"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
