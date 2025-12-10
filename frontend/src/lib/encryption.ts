// Client-side utilities for user ID masking and display

// For display purposes - show only first and last digits with asterisks
export function maskUserId(userId: string): string {
  if (!userId || userId.length < 3) return userId;

  if (userId.length === 6) {
    return `${userId[0]}${'*'.repeat(4)}${userId[5]}`;
  }

  // For other lengths, mask all but first and last character
  if (userId.length > 2) {
    return `${userId[0]}${'*'.repeat(userId.length - 2)}${userId[userId.length - 1]}`;
  }

  return userId.replace(/./g, '*');
}

// Format user ID for display with proper spacing
export function formatUserId(userId: string): string {
  if (!userId) return '';

  // Add spacing for 6-digit IDs: 123456 -> 123 456
  if (userId.length === 6) {
    return `${userId.slice(0, 3)} ${userId.slice(3)}`;
  }

  return userId;
}