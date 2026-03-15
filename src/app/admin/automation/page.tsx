import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AutomationTriggerButton } from "./trigger-button";

export const metadata: Metadata = {
  title: "Content Automation",
  description: "AI content engine automation dashboard.",
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getAutomationData() {
  const [jobs, stats] = await Promise.all([
    db.automationJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    Promise.all([
      db.automationJob.count(),
      db.automationJob.count({ where: { status: "completed" } }),
      db.automationJob.count({ where: { status: "failed" } }),
      db.automationJob.count({ where: { status: "running" } }),
      db.blogPost.count({ where: { aiGenerated: true } }),
    ]),
  ]);

  return {
    jobs,
    total: stats[0],
    completed: stats[1],
    failed: stats[2],
    running: stats[3],
    aiArticles: stats[4],
  };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function statusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function statusBadge(status: string) {
  const variant =
    status === "completed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : status === "running"
          ? "secondary"
          : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start) return "—";
  const endTime = end ? end.getTime() : Date.now();
  const seconds = Math.round((endTime - start.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AutomationPage() {
  let data;
  try {
    data = await getAutomationData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <Section size="lg">
        <Container>
          <p className="text-muted-foreground">
            Unable to load automation data. Make sure the database is connected.
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section size="lg">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="mr-1 h-4 w-4" /> Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Content Automation
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered blog content generation pipeline
              </p>
            </div>
          </div>
          <AutomationTriggerButton />
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Total Runs"
            value={data.total.toString()}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Completed"
            value={data.completed.toString()}
          />
          <StatCard
            icon={<XCircle className="h-4 w-4" />}
            label="Failed"
            value={data.failed.toString()}
          />
          <StatCard
            icon={<Loader2 className="h-4 w-4" />}
            label="Running"
            value={data.running.toString()}
          />
          <StatCard
            icon={<Bot className="h-4 w-4" />}
            label="AI Articles"
            value={data.aiArticles.toString()}
          />
        </div>

        {/* Pipeline info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Schedule
                </p>
                <p className="mt-1 font-medium">Daily at 06:00 UTC</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topics Source
                </p>
                <p className="mt-1 font-medium">NewsAPI (trending crypto)</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Article Generator
                </p>
                <p className="mt-1 font-medium">Claude (Anthropic)</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Image Generator
                </p>
                <p className="mt-1 font-medium">Stable Diffusion (HuggingFace)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent jobs table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              Recent Automation Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Topic
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Duration
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Result
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {statusIcon(job.status)}
                            {statusBadge(job.status)}
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">
                          {job.jobType}
                        </td>
                        <td className="max-w-[200px] truncate py-3 pr-4 text-xs text-muted-foreground">
                          {job.topic || "—"}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {formatDuration(job.startedAt, job.completedAt)}
                        </td>
                        <td className="max-w-[200px] truncate py-3 pr-4 text-xs">
                          {job.status === "failed" ? (
                            <span className="text-red-500">
                              {job.errorMessage || "Unknown error"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {job.resultSummary || "—"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {job.createdAt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No automation runs yet. Use the &quot;Generate Article&quot;
                button to trigger the pipeline manually, or wait for the daily
                scheduled run.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Logs viewer for most recent job */}
        {data.jobs.length > 0 && data.jobs[0].logs && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Latest Run Logs
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({data.jobs[0].id.slice(0, 8)}...)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
                {data.jobs[0].logs}
              </pre>
            </CardContent>
          </Card>
        )}
      </Container>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
