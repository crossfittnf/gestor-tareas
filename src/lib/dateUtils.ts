/**
 * Returns the current date in YYYY-MM-DD format based on LOCAL time.
 * This prevents issues where late-night shifts (e.g. 1 AM) are logged as the previous day due to UTC conversion,
 * or where different devices in the same timezone generate different IDs.
 */
export function getTodayDateString(): string {
    const now = new Date();
    // 'sv-SE' locale formats as YYYY-MM-DD
    return now.toLocaleDateString('sv-SE');
}
