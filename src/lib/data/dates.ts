/**
 * Mock data in this build is timestamped relative to the moment the app is
 * run, not hardcoded to a fixed date. This keeps News/Agenda feeling live
 * during demos instead of visibly aging. A real backend would replace this
 * with actual publish/schedule timestamps from the database.
 */

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function daysAgo(days: number, hour = 9, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function daysFromNow(days: number, hour = 9, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
