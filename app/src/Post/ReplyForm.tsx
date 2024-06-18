import React, { useState, useEffect } from 'react';
import { fireAuth } from '../firebase.ts';

interface ReplyFormProps {
  tweetId: string;
  onReplyPosted: () => void;
}


const ReplyForm: React.FC<ReplyFormProps> = ({ tweetId, onReplyPosted }) => {
  const [replyContent, setReplyContent] = useState('');
  const [profileData, setProfileData] = useState<{ name: string; age: number; username: string; avatar_url: string;} | null>(null);

useEffect(() => {
const fetchUserProfile = async () => {
  if (fireAuth.currentUser) {
    const response = await fetch(
      `https://hackathon-ro2txyk6rq-uc.a.run.app/search?uid=${fireAuth.currentUser?.uid}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      setProfileData(data[0]);
    } else {
      setProfileData(null);
    }
  }
};
fetchUserProfile();
}, []);

  const handleReplySubmit = async () => {
    if (replyContent.trim() === "") {
      alert("返信内容を入力してください");
      return;
    }

    const reply = {
      replycontent: replyContent,
      uid: fireAuth.currentUser?.uid,
      tweetid: tweetId,
      username: profileData?.username,
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
      <input
        type="text"
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="返信を入力"
      />
      <button onClick={handleReplySubmit}>返信</button>
    </div>
  );
};

export default ReplyForm;
