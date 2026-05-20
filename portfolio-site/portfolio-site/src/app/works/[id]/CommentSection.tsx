'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Send, User } from 'lucide-react';

interface CommentSectionProps {
  workId: string;
  comments: Comment[];
}

export default function CommentSection({ workId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // TODO: 実際のAPI呼び出し
    // 仮のコメント追加（デモ用）
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      user_id: 'guest',
      work_id: workId,
      content: newComment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      user: {
        id: 'guest',
        user_id: 'guest',
        name: 'ゲストユーザー',
        name_en: 'Guest User',
        role: 'Guest',
        bio: '',
        avatar_url: null,
        website: null,
        twitter: null,
        instagram: null,
        github: null,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setComments(prev => [tempComment, ...prev]);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <section className="border-4 border-black p-6 md:p-8">
      <h2 className="text-2xl font-bold uppercase mb-6">
        Comments ({comments.length})
      </h2>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="textarea-brutal flex-1 min-h-[100px]"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn-brutal btn-brutal-accent flex items-center justify-center gap-2 md:self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            送信
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※ログインするとコメントを投稿できます
        </p>
      </form>

      {/* コメント一覧 */}
      {comments.length > 0 ? (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="border-b-2 border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                {/* アバター */}
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white flex items-center justify-center">
                  {comment.user?.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">
                      {comment.user?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-8">
          まだコメントはありません。最初のコメントを投稿しましょう！
        </p>
      )}
    </section>
  );
}
