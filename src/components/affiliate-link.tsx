"use client";

import { useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// AffiliateLink
// ---------------------------------------------------------------------------
// A client component that wraps any clickable element. On click it:
//   1. Calls POST /api/click to log the affiliate click
//   2. Opens the affiliate URL in a new tab
//
// Usage:
//   <AffiliateLink exchangeId="..." sourcePage="exchange-detail" href="https://...">
//     <Button>Visit Exchange</Button>
//   </AffiliateLink>
// ---------------------------------------------------------------------------

interface AffiliateLinkProps {
  /** The exchange's database id (cuid) */
  exchangeId: string;
  /** Which page the click originated from */
  sourcePage: string;
  /** The affiliate URL to open (used as fallback if API call fails) */
  href: string;
  /** Optional user id */
  userId?: string;
  /** Children to render (typically a Button) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function AffiliateLink({
  exchangeId,
  sourcePage,
  href,
  userId,
  children,
  className,
}: AffiliateLinkProps) {
  const [pending, setPending] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pending) return;
      setPending(true);

      try {
        const res = await fetch("/api/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchangeId, sourcePage, userId }),
        });

        if (res.ok) {
          const data = await res.json();
          window.open(data.redirectUrl || href, "_blank", "noopener,noreferrer");
        } else {
          // Fallback: open the URL even if logging failed
          window.open(href, "_blank", "noopener,noreferrer");
        }
      } catch {
        // Fallback on network error
        window.open(href, "_blank", "noopener,noreferrer");
      } finally {
        setPending(false);
      }
    },
    [exchangeId, sourcePage, userId, href, pending]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={className}
    >
      {children}
    </a>
  );
}
