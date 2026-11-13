export function formatCents(cents) {
  if (cents === null || cents === undefined || isNaN(cents)) return '$0.00';
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  // SQLite CURRENT_TIMESTAMP is in UTC "YYYY-MM-DD HH:MM:SS"
  try {
    const isoString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return dateString;
  }
}

export function getAccountTypeLabel(type) {
  if (!type) return 'Standard';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'active':
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      };
    case 'pending':
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    case 'rejected':
    case 'closed':
      return {
        bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    default:
      return {
        bg: 'bg-slate-800 text-slate-300 border-slate-700',
        dot: 'bg-slate-400',
        badge: 'bg-slate-800 text-slate-300 border-slate-700'
      };
  }
}
