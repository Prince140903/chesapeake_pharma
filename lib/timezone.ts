/**
 * Timezone utility for US date/time display.
 * All data is stored in UTC in the database; this converts to US time for display.
 */

// Default US timezone - Eastern Time (most common for US business)
export const US_TIMEZONE = "America/New_York";

/**
 * Format a UTC date string to US date string (MM/DD/YYYY)
 */
export function formatUSDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    timeZone: US_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format a UTC date string to US date and time string
 */
export function formatUSDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    timeZone: US_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a UTC date string to US time string (HH:MM AM/PM)
 */
export function formatUSTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    timeZone: US_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}