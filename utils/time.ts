export function getTimestamp(
  instant: Temporal.Instant,
): Record<string, string> {
  const full = instant.toString();
  const short = instant.toZonedDateTimeISO('UTC').toPlainDate().toString();
  return {
    full: full,
    short: short,
  };
}
