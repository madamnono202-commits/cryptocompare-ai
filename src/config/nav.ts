import { NavItem } from "@/types";

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Compare", href: "/compare" },
  { title: "Exchanges", href: "/exchanges" },
  { title: "Prices", href: "/prices" },
  { title: "Offers", href: "/offers" },
  { title: "Blog", href: "/blog" },
  { title: "Tools", href: "/tools" },
  { title: "Learn", href: "/learn" },
];

export const footerNav = {
  product: [
    { title: "Compare Exchanges", href: "/compare" },
    { title: "Live Prices", href: "/prices" },
    { title: "Exclusive Offers", href: "/offers" },
    { title: "Trading Tools", href: "/tools" },
  ],
  resources: [
    { title: "Blog", href: "/blog" },
    { title: "Learn Crypto", href: "/learn" },
    { title: "Exchange Reviews", href: "/exchanges" },
  ],
  company: [
    { title: "About", href: "#" },
    { title: "Contact", href: "#" },
    { title: "Privacy Policy", href: "#" },
    { title: "Terms of Service", href: "#" },
  ],
} as const;

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin" },
  { title: "Exchanges", href: "/admin" },
  { title: "Users", href: "/admin" },
  { title: "Affiliates", href: "/admin" },
];
