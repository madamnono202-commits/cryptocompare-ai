// ---------------------------------------------------------------------------
// Simple in-memory logger for pipeline runs
// ---------------------------------------------------------------------------
// Collects log entries during a pipeline run and can be serialized to a string
// for storage in the AutomationJob.logs field.

export class PipelineLogger {
  private entries: string[] = [];

  info(message: string) {
    const entry = `[${new Date().toISOString()}] INFO: ${message}`;
    this.entries.push(entry);
    console.log(entry);
  }

  warn(message: string) {
    const entry = `[${new Date().toISOString()}] WARN: ${message}`;
    this.entries.push(entry);
    console.warn(entry);
  }

  error(message: string) {
    const entry = `[${new Date().toISOString()}] ERROR: ${message}`;
    this.entries.push(entry);
    console.error(entry);
  }

  toString(): string {
    return this.entries.join("\n");
  }
}
