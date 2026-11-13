// Staff account management & authentication storage: Single Manager Role
const STORAGE_KEY = 'AXIOM_STAFF_ACCOUNTS';

export const DEFAULT_STAFF = [
  {
    id: 'staff-manager',
    username: 'manager',
    password: 'manager123',
    name: 'Manager',
    role: 'manager',
    status: 'active',
    createdAt: '2026-01-01',
  },
];

export function getStaffList() {
  try {
    let data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('APEX_STAFF_ACCOUNTS');
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter((s) => s.role === 'manager');
      if (filtered.length > 0) return filtered;
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

  const { password: _, ...userSafe } = found;
  return userSafe;
}
