import React, { useState, useEffect } from 'react';
import { fireAuth } from '../firebase.ts';
import { Box, Text, Button, Divider, Grid, Center, Loader, Avatar } from '@mantine/core';

interface LikeButtonProps {
  tweetid: string;
  initialLike: number;
  initialIsLiked: boolean;
  onLikeChange: (tweetid: string, isLiked: boolean, likeCount: number) => void;
}

const LikeCircleButton: React.FC<LikeButtonProps> = ({ tweetid, initialLike, initialIsLiked, onLikeChange }) => {
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
    const url = isLiked ? 'https://hackathon-ro2txyk6rq-uc.a.run.app/deletecirclelike' : 'https://hackathon-ro2txyk6rq-uc.a.run.app/circlelike';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            uid: fireAuth.currentUser?.uid,
            tweetid: tweetid,
          }),
      });

      if (response.ok) {
        const data = await response.json();
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(data.like_count);
        onLikeChange(tweetid, newIsLiked, data.like_count);
      }
    } catch (error) {
      console.error('Failed to like/unlike the tweet:', error);
    }finally {
      setIsLoading(false); // リクエスト終了
    }
  };

  return (
    <Button
    size='lg'
    variant="subtle"
    onClick={handleLike} disabled={isLoading}>
      {isLiked ? '❤️' : '♡'} {likeCount}
    </Button>
  );
};

export const fetchLikedTweets = async (uid: string) => {
  try {
    const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/likedTweets?uid=${uid}`);
    const data = await response.json();
    return data
  } catch (error) {
    console.error('Failed to fetch liked tweets:', error);
    return [];
  }
};

export default LikeCircleButton;