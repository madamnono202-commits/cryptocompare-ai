"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { mainNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
            <span className="text-sm font-black text-white">CC</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search placeholder */}
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          {/* Login placeholder */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Log in
          </Button>

          {/* Signup CTA placeholder */}
          <Button size="sm" className="hidden sm:inline-flex bg-gradient-brand hover:opacity-90">
            Sign Up Free
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          "lg:hidden border-t overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-[500px]" : "max-h-0 border-t-0"
        )}
      >
        <nav className="container mx-auto flex flex-col px-4 py-4 gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t pt-4">
            <Button variant="outline" className="w-full justify-center">
              Log in
            </Button>
            <Button className="w-full justify-center bg-gradient-brand hover:opacity-90">
              Sign Up Free
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
