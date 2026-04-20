import { cls } from '../../utils/helpers'

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending: { label: 'Pending', cls: 'badge-pending' },
    approved: { label: 'Approved', cls: 'badge-approved' },
    rejected: { label: 'Rejected', cls: 'badge-rejected' },
    locked: { label: 'Locked', cls: 'badge-locked' },
  }
  const s = map[status] || map.pending
  return <span className={cls('badge', s.cls)}>{s.label}</span>
}
