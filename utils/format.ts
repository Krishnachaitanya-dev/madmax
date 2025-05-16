/**
 * Format a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol
 */
export function formatInr(amount: number): string {
  // Handle undefined or NaN
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0.00";
  }
  
  // Format with Indian locale and INR currency
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Format a time string to a readable format
 * @param timeString - Time string (e.g., "14:30")
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timeString: string): string {
  if (!timeString) return "";
  
  // If already in 12-hour format, return as is
  if (timeString.includes("AM") || timeString.includes("PM")) {
    return timeString;
  }
  
  // Parse the time string (assuming 24-hour format like "14:30")
  const [hourStr, minuteStr] = timeString.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  // Convert to 12-hour format
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format a phone number to a readable format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format Indian phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Return as is if not a standard format
  return phone;
}