type Status = 'due' | 'overdue' | 'done';

const labels = { due: 'Due soon', overdue: 'Overdue', done: 'Done' };

export default function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill status-pill--${status}`}>{labels[status]}</span>;
}

export { StatusPill };
