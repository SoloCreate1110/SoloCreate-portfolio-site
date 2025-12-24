'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  workId: string;
  initialCount: number;
  initialLiked: boolean;
}

export default function LikeButton({
  workId,
  initialCount,
  initialLiked,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = async () => {
    // アニメーション開始
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // 楽観的更新
    if (liked) {
      setCount(prev => prev - 1);
    } else {
      setCount(prev => prev + 1);
    }
    setLiked(!liked);

    // TODO: 実際のAPI呼び出し
    // try {
    //   if (liked) {
    //     await unlikeWork(workId);
    //   } else {
    //     await likeWork(workId);
    //   }
    // } catch (error) {
    //   // エラー時はロールバック
    //   setLiked(liked);
    //   setCount(initialCount);
    // }
  };

  return (
    <button
      onClick={handleLike}
      className={cn(
        'flex items-center gap-2 font-bold px-4 py-2 border-4 border-black transition-all duration-200',
        liked
          ? 'bg-red-500 text-white'
          : 'bg-white text-black hover:bg-gray-100',
        isAnimating && 'scale-110'
      )}
      aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
    >
      <Heart
        size={20}
        className={cn(
          'transition-transform duration-200',
          liked && 'fill-current',
          isAnimating && 'scale-125'
        )}
      />
      {formatNumber(count)}
    </button>
  );
}
