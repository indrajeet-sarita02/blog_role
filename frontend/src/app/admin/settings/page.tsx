'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@/lib/auth/Providers';
import { fetchSettings, updateSettings } from '@/lib/api/settings';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { extractErrorMessage } from '@/lib/api/client';
import { usePermissions } from '@/hooks/usePermissions';

export default function AdminSettingsPage() {
  const { has } = usePermissions();
  const canUpdate = has('settings.update');

  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchSettings({ limit: '100' }),
    enabled: has('settings.view'),
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data) setValues(settings.data);
  }, [settings.data]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, string>) => updateSettings(payload),
    onSuccess: () => {
      setNewKey('');
      setNewValue('');
      setError(null);
      setSuccess('Settings saved successfully.');
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const save = () => {
    const payload: Record<string, string> = { ...values };
    if (newKey.trim()) payload[newKey.trim()] = newValue;
    mutation.mutate(payload);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Site-wide key/value configuration.</p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      {settings.isLoading ? (
        <PageLoader />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>General settings</CardTitle>
          </CardHeader>
          <CardBody>
            {Object.keys(values).length === 0 && !newKey.trim() && (
              <p className="mb-4 text-sm text-gray-500">
                No settings yet. Add your first setting below (e.g. <code>site_name</code>).
              </p>
            )}

            <div className="space-y-3">
              {Object.entries(values).map(([key, value]) => (
                <div key={key} className="flex flex-wrap items-center gap-3">
                  <span className="w-56 truncate text-sm font-medium text-gray-700">{key}</span>
                  <Input
                    className="flex-1"
                    value={value}
                    disabled={!canUpdate}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            {canUpdate && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-900">Add a new setting</p>
                <div className="flex flex-wrap items-end gap-3">
                  <Input
                    label="Key"
                    placeholder="site_name"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-56"
                  />
                  <Input
                    label="Value"
                    placeholder="My Blog"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {canUpdate && (
              <div className="mt-6">
                <Button onClick={save} loading={mutation.isLoading}>
                  Save settings
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}