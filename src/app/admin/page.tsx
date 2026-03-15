import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | CryptoCompare AI",
  description: "Admin dashboard for CryptoCompare AI.",
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Admin panel coming soon.
      </p>
    </div>
  );
}
