import { statusStyles, statusLabel } from '@/lib/utils/format';

export function Badge({ status }: { status: string }) {
  const styles = statusStyles[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {statusLabel(status)}
    </span>
  );
}