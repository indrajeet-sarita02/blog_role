import { Alert } from '@/components/ui/Alert';

export function AccessDenied({ permissionLabel }: { permissionLabel?: string }) {
  return (
    <div className="mx-auto max-w-md py-16">
      <Alert type="info">
        <p className="font-semibold text-gray-900">Access denied</p>
        <p className="mt-1">
          You don&apos;t have permission to view this page{permissionLabel ? ` (${permissionLabel})` : ''}.
          Contact an administrator if you believe this is a mistake.
        </p>
      </Alert>
    </div>
  );
}
