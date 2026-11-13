// Staff account management & authentication storage: Exactly 2 accounts (Teller & Manager)
const STORAGE_KEY = 'APEX_STAFF_ACCOUNTS';

export const DEFAULT_STAFF = [
  {
    id: 'staff-teller',
    username: 'teller',
    password: 'teller123',
    name: 'Teller',
    role: 'teller', // Makes the requests (submits account applications & money requests)
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'staff-manager',
    username: 'manager',
    password: 'manager123',
    name: 'Manager',
    role: 'manager', // Accepts / approves requests (reviews account applications & transactions)
    status: 'active',
    createdAt: '2026-01-01',
  },
];

export function getStaffList() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Keep strictly the 2 designated accounts (teller and manager)
      const filtered = parsed.filter((s) => s.role === 'teller' || s.role === 'manager');
      if (filtered.length === 2) return filtered;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
    return DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
}

export function authenticateStaff(username, password) {
  const staffList = getStaffList();
  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  const found = staffList.find(
    (s) => s.username.toLowerCase() === cleanUser && s.password === cleanPass
  );

  if (!found) return null;
  if (found.status === 'disabled') {
    throw new Error('This account is currently disabled.');
  }

  // Return user info without exposing password
  const { password: _, ...userSafe } = found;
  return userSafe;
}
