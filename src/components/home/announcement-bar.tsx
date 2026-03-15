"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const messages = [
  "New: Compare exchange fees side-by-side with our AI-powered tool",
  "Exclusive: Get up to $30,000 in deposit bonuses through our partner links",
  "Updated: 2025 crypto exchange security ratings now available",
  "Trending: Bitcoin hits new highs — compare the best exchanges to trade BTC",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-brand text-white">
      <div className="container mx-auto flex items-center justify-center px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium sm:text-sm">
          {messages[index]}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
