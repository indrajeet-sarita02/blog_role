'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/auth/Providers';
import { fetchPostComments, createComment, updateComment, deleteComment } from '@/lib/api/comments';
import { useAuth } from '@/lib/auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { extractErrorMessage } from '@/lib/api/client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils/format';
import { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  isAuthenticated: boolean;
  canEdit: (c: Comment) => boolean;
  canDelete: (c: Comment) => boolean;
  onReply: (parentId: number, content: string) => void;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

function CommentItem({
  comment,
  isAuthenticated,
  canEdit,
  canDelete,
  onReply,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const replies = comment.replies ?? [];

  return (
    <li className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-gray-900">{comment.user?.name ?? 'User'}</span>
        <span className="text-xs text-gray-400">{formatDateTime(comment.createdAt)}</span>
        {comment.status && comment.status !== 'approved' && <Badge status={comment.status} />}
      </div>

      {editing ? (
        <div className="mt-2">
          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (editText.trim()) onUpdate(comment.id, editText.trim());
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700">{comment.content}</p>
      )}

      <div className="mt-2 flex items-center gap-3">
        {isAuthenticated && !editing && (
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Reply
          </button>
        )}
        {canEdit(comment) && !editing && (
          <button
            onClick={() => {
              setEditText(comment.content);
              setEditing(true);
            }}
            className="text-xs font-medium text-gray-500 hover:text-gray-800"
          >
            Edit
          </button>
        )}
        {canDelete(comment) && (
          <button
            onClick={() => {
              if (confirm('Delete this comment?')) onDelete(comment.id);
            }}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-3">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              disabled={!replyText.trim()}
              onClick={() => {
                onReply(comment.id, replyText.trim());
                setReplyText('');
                setReplying(false);
              }}
            >
              Reply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <ul className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isAuthenticated={isAuthenticated}
              canEdit={canEdit}
              canDelete={canDelete}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function buildTree(comments: Comment[]): Comment[] {
  const map = new Map<number, Comment>();
  comments.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  const roots: Comment[] = [];
  for (const comment of Array.from(map.values())) {
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export function CommentSection({ postId }: { postId: number }) {
  const { isAuthenticated, user } = useAuth();
  const { has } = usePermissions();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const comments = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => fetchPostComments(postId),
    enabled: isAuthenticated,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });

  const createMutation = useMutation({
    mutationFn: (payload: { content: string; parentId?: number | null }) =>
      createComment(postId, payload),
    onSuccess: () => {
      setContent('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content: text }: { id: number; content: string }) => updateComment(id, text),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => invalidate(),
    onError: (err) => setError(extractErrorMessage(err)),
  });

  const canEdit = (c: Comment) => (c.userId === user?.id && has('comment.update')) || has('comment.updateAny');
  const canDelete = (c: Comment) => (c.userId === user?.id && has('comment.delete')) || has('comment.deleteAny');

  const tree = buildTree(comments.data?.data ?? []);

  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Comments</h3>

      {isAuthenticated ? (
        <div className="mb-6">
          <Textarea
            label="Add a comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
          />
          {error && (
            <div className="mt-2">
              <Alert type="error">{error}</Alert>
            </div>
          )}
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => createMutation.mutate({ content: content.trim() })}
              disabled={!content.trim()}
              loading={createMutation.isLoading}
            >
              Post comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-6 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>{' '}
          to view and join the discussion.
        </p>
      )}

      {!isAuthenticated ? null : comments.isLoading ? (
        <p className="text-sm text-gray-400">Loading comments…</p>
      ) : comments.isError ? (
        <Alert type="error">Unable to load comments.</Alert>
      ) : tree.length === 0 ? (
        <p className="text-sm text-gray-500">Be the first to leave a comment.</p>
      ) : (
        <ul className="space-y-4">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthenticated={isAuthenticated}
              canEdit={canEdit}
              canDelete={canDelete}
              onReply={(parentId, text) => createMutation.mutate({ content: text, parentId })}
              onUpdate={(id, text) => updateMutation.mutate({ id, content: text })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}