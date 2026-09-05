'use client';

import { Fragment, useState } from 'react';
import { useQuery } from '@/lib/auth/Providers';
import { fetchAuditLogs, AuditLog } from '@/lib/api/audit';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/guards/AccessDenied';

const MODULES = [
  'auth',
  'blog',
  'comment',
  'category',
  'tag',
  'media',
  'user',
  'role',
  'permission',
  'setting',
  'audit',
  'notification',
];

export default function AdminAuditLogsPage() {
  const { has } = usePermissions();
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const logs = useQuery({
    queryKey: ['audit', { page, module, action }],
    queryFn: () =>
      fetchAuditLogs({
        page: String(page),
        limit: '20',
        ...(module ? { module } : {}),
        ...(action ? { action } : {}),
      }),
    enabled: has('audit.view'),
  });

  const renderValue = (value: unknown) =>
    value === null || value === undefined ? '—' : JSON.stringify(value, null, 2);

  if (!has('audit.view')) {
    return <AccessDenied />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit logs</h1>
        <p className="mt-1 text-sm text-gray-500">A trail of actions performed across the system.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
          className="w-48"
          options={[{ value: '', label: 'All modules' }, ...MODULES.map((m) => ({ value: m, label: m }))]}
        />
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Filter by action (e.g. BLOG_CREATED)…"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log entries</CardTitle>
        </CardHeader>
        <CardBody className="px-0">
          {logs.isLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Module</th>
                    <th className="px-5 py-3 font-medium">Actor</th>
                    <th className="px-5 py-3 font-medium">Entity</th>
                    <th className="px-5 py-3 font-medium">IP</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                        No logs found.
                      </td>
                    </tr>
                  )}
                  {logs.data?.data.map((log: AuditLog) => (
                    <Fragment key={log.id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                      >
                        <td className="px-5 py-3">
                          <Badge status={log.action} />
                        </td>
                        <td className="px-5 py-3 text-gray-500">{log.module}</td>
                        <td className="px-5 py-3 text-gray-900">{log.actor?.name ?? log.actorId}</td>
                        <td className="px-5 py-3 text-gray-500">
                          {log.entityType ? `${log.entityType}#${log.entityId ?? ''}` : '—'}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{log.ipAddress || '—'}</td>
                        <td className="px-5 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                      </tr>
                      {expanded === log.id && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 px-5 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Before
                                </p>
                                <pre className="overflow-x-auto rounded bg-white p-3 text-xs text-gray-700">
                                  {renderValue(log.oldValues)}
                                </pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  After
                                </p>
                                <pre className="overflow-x-auto rounded bg-white p-3 text-xs text-gray-700">
                                  {renderValue(log.newValues)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {logs.data?.meta && (
            <div className="px-5 pb-4">
              <Pagination meta={logs.data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}