import React, { useState, useEffect } from 'react';
import { fireAuth } from '../firebase.ts';
import { Box, Button, Textarea, FileInput, Image } from '@mantine/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { IconPhoto } from '@tabler/icons-react';

interface ReplyFormProps {
  tweetId: string;
  onReplyPosted: () => void;
}


const ReplyForm: React.FC<ReplyFormProps> = ({ tweetId, onReplyPosted }) => {
  const [replyContent, setReplyContent] = useState('');
  const [profileData, setProfileData] = useState<{ name: string; age: number; username: string; avatar_url: string;} | null>(null);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [imagePreview, setReplyPreview] = useState<string | null>(null);

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

    let image_url = "";
        if (replyImage) {
          image_url = await uploadImageAndGetUrl(replyImage);
        }

    const reply = {
      replycontent: replyContent,
      uid: fireAuth.currentUser?.uid,
      tweetid: tweetId,
      username: profileData?.username,
      image: image_url,
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
        setReplyImage(null);
        setReplyPreview(null);
        onReplyPosted();
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `tweet_images/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setReplyImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReplyImage(null);
      setReplyPreview(null);
    }
  };


  return (
    <Box mt="sm">
      {imagePreview && <Image src={imagePreview} style={{ maxWidth: '30%', height: 'auto'}} alt="Profile Preview" radius="md" />}
      <Textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="返信を入力"
        autosize
        minRows={2}
      />
      <FileInput
          onChange={handleImageChange}
          accept="image/*"
          icon={<IconPhoto size={27} />}
          style={{ width: '5%', marginTop: '20px' }}
              />
      <Button
      color='indigo'
      onClick={handleReplySubmit} mt="sm" disabled={!replyContent && !replyImage}>返信</Button>
    </Box>
  );
};

export default ReplyForm;
