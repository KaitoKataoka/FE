import React, { useState, useEffect } from 'react';
import { fireAuth } from '../firebase.ts';

interface ReplyLikeButtonProps {
  replyid: string;
  initialLike: number;
  initialIsLiked: boolean;
  onLikeChange: (replyid: string, isLiked: boolean, likeCount: number) => void;
}

const ReplyLikeButton: React.FC<ReplyLikeButtonProps> = ({ replyid, initialLike, initialIsLiked, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLike);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(initialLike);
  }, [initialIsLiked, initialLike]);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const method = isLiked ? 'DELETE' : 'POST';
    const url = isLiked ? 'https://hackathon-ro2txyk6rq-uc.a.run.app/deletereplylike' : 'https://hackathon-ro2txyk6rq-uc.a.run.app/replylike';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: fireAuth.currentUser?.uid,
          replyid: replyid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(data.like_count);
        onLikeChange(replyid, newIsLiked, data.like_count);
        console.log(`Reply ${replyid} liked status: ${newIsLiked}, like count: ${data.like_count}`); // Debug log
      } else {
        console.error('Failed to like/unlike the reply:', await response.text());
      }
    } catch (error) {
      console.error('Failed to like/unlike the reply:', error);
    } finally {
      setIsLoading(false); // リクエスト終了
    }
  };

  return (
    <button onClick={handleLike} disabled={isLoading}>
      {isLiked ? '❤️' : '♡'} {likeCount}
    </button>
  );
};

export const fetchLikedReply = async (uid: string) => {
  try {
    const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/likedreply?uid=${uid}`);
    const data = await response.json();
    return data
  } catch (error) {
    console.error('Failed to fetch liked tweets:', error);
    return [];
  }
};

export default ReplyLikeButton;
