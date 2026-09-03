'use client';

import { useQuery } from '@/lib/auth/Providers';
import { fetchPermissions } from '@/lib/api/roles';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { usePermissions } from '@/hooks/usePermissions';

export default function AdminPermissionsPage() {
  const { has } = usePermissions();
  const permissions = useQuery({
    queryKey: ['permissions-list'],
    queryFn: () => fetchPermissions({ limit: '100' }),
    enabled: has('permission.view'),
  });

  const modules = Array.from(new Set(permissions.data?.data.map((p) => p.module) ?? []));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
        <p className="mt-1 text-sm text-gray-500">
          All permission slugs in the system. Permissions are assigned to roles.
        </p>
      </div>

      {permissions.isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          {modules.map((mod) => (
            <Card key={mod}>
              <CardHeader>
                <CardTitle className="capitalize">{mod}</CardTitle>
              </CardHeader>
              <CardBody>
                {permissions.data?.data
                  .filter((p) => p.module === mod)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
                      </div>
                      <Badge status={p.slug} />
                    </div>
                  ))}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}