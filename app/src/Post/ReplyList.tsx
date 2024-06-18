import React, { useEffect, useState } from 'react';
import ReplyLikeButton from './Reply_like.tsx';
import { fireAuth } from '../firebase.ts';
import { fetchLikedReply } from './Reply_like.tsx';

interface Reply {
  replyid: string;
  tweetid: string;
  replycontent: string;
  username: string;
  time: string;
  like: number;
  isLiked: boolean;
}

interface ReplyListProps {
  tweetId: string;
  onReplyPosted: () => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ tweetId, onReplyPosted }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedTweets, setLikedTweets] = useState<string[]>([]);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        if (fireAuth.currentUser) {
          console.log(tweetId)
          const likedTweetsData = await fetchLikedReply(fireAuth.currentUser.uid);
          setLikedTweets(likedTweetsData);
          const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchreply?tweetid=${tweetId}`);
          const data = await response.json();
          if (data) {
            const replys = data.map((reply: any) => ({
              replyid: reply.replyid,
              tweetid: reply.tweetid,
              replycontent: reply.replycontent,
              username: reply.username,
              time: reply.time,
              like: reply.like,
              isLiked: likedTweetsData.includes(reply.replyid),
            }));
            setReplies(replys);
            console.log("Replies fetched successfully:", replys); // Debug log
          }
        }
      } catch (error) {
        console.error('Error fetching replies:', error);
      }
    };

    fetchReplies();
    onReplyPosted();
  }, [tweetId]);

  const handleLikeChange = (replyid: string, isLiked: boolean, likeCount: number) => {
    setLikedTweets(prev => isLiked ? [...prev, replyid] : prev.filter(id => id !== replyid));
    setReplies(prevReplies =>
      prevReplies.map(reply =>
        reply.replyid === replyid ? { ...reply, like: likeCount, isLiked } : reply
      )
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div>
      {replies.map((reply) => (
        <div key={reply.replyid}>
          <p>{reply.username}</p>
          <p>{reply.replycontent}</p>
          <p>{formatDateTime(reply.time)}</p>
          <ReplyLikeButton
            replyid={reply.replyid}
            initialLike={reply.like}
            initialIsLiked={reply.isLiked}
            onLikeChange={handleLikeChange}
          />
        </div>
      ))}
    </div>
  );
};

export default ReplyList;
