'use client';

import { useState } from 'react';
import { useMutation } from '@/lib/auth/Providers';
import { useAuth } from '@/lib/auth/AuthProvider';
import { updateUser } from '@/lib/api/auth';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { extractErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/utils/format';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { has } = usePermissions();
  const [name, setName] = useState(user?.name ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canUpdate = has('user.update');

  const mutation = useMutation({
    mutationFn: (payload: { name: string; avatar?: string; bio?: string }) =>
      updateUser(user!.id, payload),
    onSuccess: async () => {
      await refreshUser();
      setSuccess('Profile updated successfully.');
      setError(null);
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your account information.</p>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge status={user?.status ?? ''} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Member since</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(user?.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {user?.roles?.map((role) => <Badge key={role.id} status={role.slug} />)}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      {canUpdate && (
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate({ name, avatar: avatar || undefined, bio: bio || undefined });
              }}
            >
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://…/avatar.png"
              />
              <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              <Button type="submit" loading={mutation.isLoading}>
                Save changes
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}