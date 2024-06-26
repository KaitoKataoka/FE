import React, { useEffect, useState, useCallback } from 'react';
import ReplyLikeButton from './Reply_like.tsx';
import { fireAuth } from '../firebase.ts';
import { fetchLikedReply } from './Reply_like.tsx';
import ReplyForm from './ReplyForm.tsx';
import { Box, Text, Button, Divider, Grid, Center, Loader, Avatar, Image, Input } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconSearch } from '@tabler/icons-react';
import HashtagText from './Hashtag.tsx';
import { useMediaQuery } from '@mantine/hooks';
interface Reply {
  replyid: string;
  tweetid: string;
  replycontent: string;
  uid: string;
  username: string;
  time: string;
  like: number;
  isLiked: boolean;
  avatar_url: string;
  image: string
}

interface ReplyListProps {
  tweetId: string;
  onHashtagsExtracted: (hashtags: string[]) => void;
}

const ReplyList: React.FC<ReplyListProps> = ({ tweetId, onHashtagsExtracted }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likedTweets, setLikedTweets] = useState<string[]>([]);
  const [replyLoading, setReplyLoading] = useState<boolean>(true);
  const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<boolean>(false);
  const navigate = useNavigate();
  const [replySearchTerm, setReplySearchTerm] = useState<string>('');
  const isMobile2 = useMediaQuery(`(max-width: ${1050}px)`);
  const isMobile = useMediaQuery(`(max-width: ${767}px)`);


  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[^\s#]+/g;
    return text.match(hashtagRegex) || [];
  };

  useEffect(() => {
    fetchReplies();
  }, [tweetId]);

  const fetchReplies = useCallback(async () => {
    try {
      setReplyLoading(true);
      let likedTweetsData: string[] = [];
      if (fireAuth.currentUser) {
        likedTweetsData = await fetchLikedReply(fireAuth.currentUser.uid) || [];
        setLikedTweets(likedTweetsData);
      }
      const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchreply?tweetid=${tweetId}`);
      const data = await response.json();
      const avatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${data[0].uid}`);
      const avatardata = await avatarresponse.json();

      if (data) {
        const replys = data.map((reply: any) => ({
          replyid: reply.replyid,
          tweetid: reply.tweetid,
          replycontent: reply.replycontent,
          uid: reply.uid,
          username: reply.username,
          time: reply.time,
          like: reply.like,
          isLiked: likedTweetsData.includes(reply.replyid),
          avatar_url: avatardata.avatar_url,
          image: reply.image
        }));
        setReplies(replys);
        console.log("Replies fetched successfully:", replys);
        const allHashtags = replys.flatMap(reply => extractHashtags(reply.replycontent));
        onHashtagsExtracted(Array.from(new Set(allHashtags)));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setReplyLoading(false);
    }
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

  const handleReplyPosted = () => {
    fetchReplies(); // 返信が投稿された後に返信リストを再取得
  };

  const handleUserClick = (uid: string) => {
    navigate(`/userProfile/${uid}`);
  };

  const filteredReply = replies.filter(reply =>
    reply.replycontent.toLowerCase().includes(replySearchTerm.toLowerCase())
  );

  const handleReplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplySearchTerm(e.target.value);
  };

  return (
    <Box>
      {replyLoading ? (
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" />
        </Center>
      ) : (
        <>
        <Input
                type="text"
                placeholder="返信を検索"
                value={replySearchTerm}
                onChange={handleReplySearch}
                style={{ width: '60%', marginBottom: '20px' }}
                icon={<IconSearch size={20} />}
              />
          {filteredReply.slice(0, showAllReplies ? replies.length : 2).reverse().map((reply) => (
            <Box key={reply.replyid} mb="lg">
              <Grid>
                <Grid.Col span={2}>
                  <Avatar src={reply.avatar_url} onClick={() => handleUserClick(reply.uid)} alt="Profile" size={isMobile2 ? (isMobile? 20:30):40} radius="xl" />
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text size="lg" weight={700}>{reply.username}</Text>
                  <Text size="s" color='gray'>{formatDateTime(reply.time)}</Text>
                  {reply.image && <Image src = {reply.image} style={{ maxWidth: '30%', height: 'auto'}}  radius="md"></Image>}
                  <HashtagText text={reply.replycontent} />
                  <ReplyLikeButton
                    replyid={reply.replyid}
                    initialLike={reply.like}
                    initialIsLiked={reply.isLiked}
                    onLikeChange={handleLikeChange}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          ))}
          {replies.length > 2 && (
            <Button
            variant="subtle"
            onClick={() => setShowAllReplies(!showAllReplies)} >
              {showAllReplies ? '返信を非表示にする' : '返信を表示する'}
            </Button>
          )}
        </>
      )}
      <Button
      variant="subtle"
      color='indigo'
      onClick={() => setShowReplyForm(!showReplyForm)}>返信をポスト</Button>
      {showReplyForm && (
        <ReplyForm
          tweetId={tweetId}
          onReplyPosted={handleReplyPosted}
        />
      )}
    </Box>
  );
};

export default ReplyList;
