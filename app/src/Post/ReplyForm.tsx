import React, { useState } from 'react';
import { fireAuth } from '../firebase.ts';

interface ReplyFormProps {
  tweetId: string;
  userName: string;
  onReplyPosted: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ tweetId, userName, onReplyPosted }) => {
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = async () => {
    if (replyContent.trim() === "") {
      alert("返信内容を入力してください");
      return;
    }

    const reply = {
      replycontent: replyContent,
      uid: fireAuth.currentUser?.uid,
      tweetid: tweetId,
      username: userName,
    };

    try {
      const response = await fetch("https://hackathon-ro2txyk6rq-uc.a.run.app/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reply),
      });

      if (response.ok) {
        setReplyContent('');
        onReplyPosted();
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  return (
    <div>
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="返信内容を入力してください"
      />
      <button onClick={handleReplySubmit}>返信を投稿</button>
    </div>
  );
};

export default ReplyForm;
