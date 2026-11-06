import { User, MediaItem, InviteLink } from '../types';

/**
 * Checks if a user has admin permissions
 */
export function hasAdminPrivilege(user: User | null): boolean {
  if (!user || user.status !== 'approved') return false;
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Checks if a user is the super admin (Creator Kunal Saxena)
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user || user.status !== 'approved') return false;
  return user.role === 'super_admin';
}

/**
 * Checks if an invite link is valid (not revoked and not expired)
 */
export function isInviteValid(invite: InviteLink, currentDate: Date = new Date()): boolean {
  if (invite.isRevoked) return false;
  const expiry = new Date(invite.expiresAt);
  return expiry.getTime() > currentDate.getTime();
}

/**
 * Calculates days remaining until the next birthday given an ISO/date string YYYY-MM-DD
 */
export function getDaysUntilBirthday(birthdayStr?: string, fromDate: Date = new Date()): number | null {
  if (!birthdayStr) return null;
  const parts = birthdayStr.split('-');
  if (parts.length < 3) return null;

  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const birthDay = parseInt(parts[2], 10);

  const currentYear = fromDate.getFullYear();
  let nextBirthday = new Date(currentYear, birthMonth, birthDay);

  // Set time to midnight for consistent comparison
  nextBirthday.setHours(0, 0, 0, 0);
  const compDate = new Date(fromDate);
  compDate.setHours(0, 0, 0, 0);

  if (nextBirthday.getTime() < compDate.getTime()) {
    nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
  }

  const diffTime = nextBirthday.getTime() - compDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Filters and ranks upcoming birthdays within the next N days
 */
export function getUpcomingBirthdays(users: User[], maxDays: number = 60, currentDate: Date = new Date()) {
  return users
    .map(user => {
      const daysLeft = getDaysUntilBirthday(user.birthday, currentDate);
      return { user, daysLeft };
    })
    .filter((item): item is { user: User; daysLeft: number } => item.daysLeft !== null && item.daysLeft <= maxDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Checks if a newly uploaded item is a duplicate based on file hash or file size + name
 */
export function isDuplicateMedia(existingItems: MediaItem[], newHash?: string, newFileName?: string, newSize?: number): MediaItem | null {
  if (newHash) {
    const matchByHash = existingItems.find(item => item.fileHash === newHash);
    if (matchByHash) return matchByHash;
  }

  if (newFileName && newSize) {
    const matchByNameSize = existingItems.find(
      item => item.fileName.toLowerCase() === newFileName.toLowerCase() && item.fileSize === newSize
    );
    if (matchByNameSize) return matchByNameSize;
  }

  return null;
}

/**
 * Parses natural-language search query into filter parameters
 */
export function parseNaturalLanguageQuery(query: string): {
  year?: number;
  tags?: string[];
  type?: 'photo' | 'video' | 'audio';
  categoryKeywords?: string[];
  cleanQuery: string;
} {
  const normalized = query.toLowerCase().trim();
  let year: number | undefined;
  const yearMatch = normalized.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  let type: 'photo' | 'video' | 'audio' | undefined;
  if (/फोटो|photo|pic|image/i.test(normalized)) {
    type = 'photo';
  } else if (/वीडियो|video|clip|recording/i.test(normalized)) {
    type = 'video';
  } else if (/म्यूजिक|गाना|संगीत|audio|song|music|bhajan/i.test(normalized)) {
    type = 'audio';
  }

  const categoryKeywords: string[] = [];
  if (/diwali|दीवाली|दिवाली/i.test(normalized)) categoryKeywords.push('Diwali');
  if (/garba|गरबा|navratri|नवरात्रि/i.test(normalized)) categoryKeywords.push('Garba');
  if (/birthday|जन्मदिन/i.test(normalized)) categoryKeywords.push('Birthday');
  if (/wedding|शादी|विवाह/i.test(normalized)) categoryKeywords.push('Wedding');
  if (/trip|tour|सफ़र|यात्रा/i.test(normalized)) categoryKeywords.push('Trip');

  return {
    year,
    type,
    categoryKeywords,
    cleanQuery: normalized
  };
}
