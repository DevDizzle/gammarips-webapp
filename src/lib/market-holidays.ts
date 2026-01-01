'use server';

import { isSameDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Source: NYSE, NASDAQ holiday calendars
const US_STOCK_MARKET_HOLIDAYS_2024 = [
  '2024-01-01', // New Year's Day
  '2024-01-15', // Martin Luther King, Jr. Day
  '2024-02-19', // Washington's Birthday (Presidents' Day)
  '2024-03-29', // Good Friday
  '2024-05-27', // Memorial Day
  '2024-06-19', // Juneteenth National Independence Day
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-11-28', // Thanksgiving Day
  '2024-12-25', // Christmas Day
];

const US_STOCK_MARKET_HOLIDAYS_2025 = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // Martin Luther King, Jr. Day
  '2025-02-17', // Washington's Birthday (Presidents' Day)
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-06-19', // Juneteenth National Independence Day
  '2025-07-04', // Independence Day
  '2_025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving Day
  '2025-12-25', // Christmas Day
];

const ALL_HOLIDAYS = [
    ...US_STOCK_MARKET_HOLIDAYS_2024,
    ...US_STOCK_MARKET_HOLIDAYS_2025
].map(dateStr => parseISO(dateStr));

/**
 * Checks if a given date is a US stock market holiday.
 * Uses the New York timezone to correctly identify the date.
 * @param date The date to check. Defaults to the current date.
 * @returns True if the date is a market holiday, false otherwise.
 */
export function isMarketHoliday(date: Date = new Date()): boolean {
  const nyDate = toZonedTime(date, 'America/New_York');
  
  for (const holiday of ALL_HOLIDAYS) {
    // isSameDay correctly compares dates irrespective of time
    if (isSameDay(nyDate, holiday)) {
      return true;
    }
  }

  // Also check for early close on Thanksgiving Eve (not a full holiday, but worth noting)
  // For this function, we only care about full-day closures.

  return false;
}
