import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasAdminPrivilege,
  isSuperAdmin,
  isInviteValid,
  getDaysUntilBirthday,
  getUpcomingBirthdays,
  isDuplicateMedia,
  parseNaturalLanguageQuery
} from './familyLogic';
import { User, MediaItem, InviteLink } from '../types';

test('hasAdminPrivilege grants access only to approved admins and super admins', () => {
  const superAdminUser: User = {
    id: '1',
    name: 'Kunal Saxena',
    email: '04227kunalsaxena@gmail.com',
    role: 'super_admin',
    status: 'approved',
    createdAt: '2026-01-01'
  };
  const regularAdmin: User = {
    id: '2',
    name: 'Rajesh Gaikwad',
    email: 'rajesh@example.com',
    role: 'admin',
    status: 'approved',
    createdAt: '2026-01-01'
  };
  const member: User = {
    id: '3',
    name: 'Amit Gaikwad',
    email: 'amit@example.com',
    role: 'member',
    status: 'approved',
    createdAt: '2026-01-01'
  };
  const pendingAdmin: User = {
    id: '4',
    name: 'Pending Admin',
    email: 'pending@example.com',
    role: 'admin',
    status: 'pending',
    createdAt: '2026-01-01'
  };

  assert.equal(hasAdminPrivilege(superAdminUser), true);
  assert.equal(isSuperAdmin(superAdminUser), true);
  assert.equal(hasAdminPrivilege(regularAdmin), true);
  assert.equal(isSuperAdmin(regularAdmin), false);
  assert.equal(hasAdminPrivilege(member), false);
  assert.equal(hasAdminPrivilege(pendingAdmin), false);
  assert.equal(hasAdminPrivilege(null), false);
});

test('isInviteValid checks expiration and revocation status', () => {
  const activeInvite: InviteLink = {
    id: 'inv-1',
    token: 'valid-token',
    createdBy: 'admin',
    createdByName: 'Kunal',
    createdAt: '2026-11-01T00:00:00.000Z',
    expiresAt: '2026-11-10T00:00:00.000Z',
    isRevoked: false
  };

  const expiredInvite: InviteLink = {
    ...activeInvite,
    expiresAt: '2026-10-01T00:00:00.000Z'
  };

  const revokedInvite: InviteLink = {
    ...activeInvite,
    isRevoked: true
  };

  const currentDate = new Date('2026-11-03T10:00:00.000Z');
  assert.equal(isInviteValid(activeInvite, currentDate), true);
  assert.equal(isInviteValid(expiredInvite, currentDate), false);
  assert.equal(isInviteValid(revokedInvite, currentDate), false);
});

test('getDaysUntilBirthday calculates accurate days and wraps years', () => {
  const refDate = new Date('2026-11-03T00:00:00.000Z');

  // Birthday tomorrow
  const daysTomorrow = getDaysUntilBirthday('1990-11-04', refDate);
  assert.equal(daysTomorrow, 1);

  // Birthday today
  const daysToday = getDaysUntilBirthday('1995-11-03', refDate);
  assert.equal(daysToday, 0);

  // Birthday that already passed this year (in January) -> rolls to next year
  const daysPast = getDaysUntilBirthday('1980-01-10', refDate);
  assert(daysPast! > 60);
});

test('getUpcomingBirthdays sorts nearest birthdays first', () => {
  const refDate = new Date('2026-11-03T00:00:00.000Z');
  const users: User[] = [
    {
      id: 'u1',
      name: 'Far Away',
      email: 'a@ex.com',
      role: 'member',
      status: 'approved',
      birthday: '1990-06-15',
      createdAt: ''
    },
    {
      id: 'u2',
      name: 'Very Soon',
      email: 'b@ex.com',
      role: 'member',
      status: 'approved',
      birthday: '1995-11-05', // 2 days away
      createdAt: ''
    },
    {
      id: 'u3',
      name: 'Next Week',
      email: 'c@ex.com',
      role: 'member',
      status: 'approved',
      birthday: '2000-11-10', // 7 days away
      createdAt: ''
    }
  ];

  const upcoming = getUpcomingBirthdays(users, 30, refDate);
  assert.equal(upcoming.length, 2);
  assert.equal(upcoming[0].user.name, 'Very Soon');
  assert.equal(upcoming[0].daysLeft, 2);
  assert.equal(upcoming[1].user.name, 'Next Week');
  assert.equal(upcoming[1].daysLeft, 7);
});

test('isDuplicateMedia identifies duplicates by hash and name+size', () => {
  const existing: MediaItem[] = [
    {
      id: 'm1',
      type: 'photo',
      title: 'Family Gathering',
      description: 'Diwali photo',
      url: '/uploads/diwali.jpg',
      originalUrl: '/uploads/diwali.jpg',
      fileName: 'diwali.jpg',
      fileSize: 204800,
      mimeType: 'image/jpeg',
      fileHash: 'abcdef1234567890',
      folderId: 'f1',
      folderName: 'Diwali Memories',
      uploaderId: 'u1',
      uploaderName: 'Kunal',
      uploadDate: '2026-11-01',
      tags: [],
      likes: [],
      comments: [],
      isFavorite: false
    }
  ];

  // Match by hash
  const matchHash = isDuplicateMedia(existing, 'abcdef1234567890', 'different_name.jpg', 9999);
  assert.equal(matchHash?.id, 'm1');

  // Match by filename and size
  const matchNameSize = isDuplicateMedia(existing, 'other_hash', 'diwali.jpg', 204800);
  assert.equal(matchNameSize?.id, 'm1');

  // Non duplicate
  const noMatch = isDuplicateMedia(existing, 'fresh_hash', 'new_pic.jpg', 12345);
  assert.equal(noMatch, null);
});

test('parseNaturalLanguageQuery parses years, categories and media types', () => {
  const query1 = parseNaturalLanguageQuery('Show Diwali 2024 family photos');
  assert.equal(query1.year, 2024);
  assert.equal(query1.type, 'photo');
  assert.deepEqual(query1.categoryKeywords, ['Diwali']);

  const query2 = parseNaturalLanguageQuery('शादी 2025 का वीडियो');
  assert.equal(query2.year, 2025);
  assert.equal(query2.type, 'video');
  assert.deepEqual(query2.categoryKeywords, ['Wedding']);
});
