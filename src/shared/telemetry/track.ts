/**
 * Telemetry stub — no-op function (claude.md §6.3).
 * Wire to an analytics provider post-MVP.
 * Instrumentation call sites can import this now.
 */

export function track(_event: string, _properties?: Record<string, unknown>): void {
  // No-op in Phase 0. Analytics provider wired post-MVP.
}
