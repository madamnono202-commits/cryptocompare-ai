import { Metadata } from "next";
import { BarChart3, Building2, Settings, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for CryptoCompare AI.",
};

const adminCards = [
  { title: "Total Exchanges", value: "—", icon: Building2 },
  { title: "Total Users", value: "—", icon: Users },
  { title: "Affiliate Clicks", value: "—", icon: BarChart3 },
  { title: "System Status", value: "OK", icon: Settings },
];

export default function AdminPage() {
  return (
    <Section size="lg">
      <Container>
        <div className="flex items-center gap-3">
          <PageHeader heading="Admin Dashboard" />
          <Badge variant="outline" className="mt-1">
            Protected
          </Badge>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin sections */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Placeholder
            label="Exchange Management"
            description="CRUD table for managing exchange listings and affiliate links."
          />
          <Placeholder
            label="Analytics Overview"
            description="Click tracking, revenue stats, and conversion charts."
          />
        </div>
      </Container>
    </Section>
  );
}
