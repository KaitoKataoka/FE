import { fireAuth } from '../firebase.ts';
import React, { useState, useEffect, useCallback } from 'react';
import Contentform from './Newpost.tsx';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import "./Post_App.css";
import defaultAvatar from '../assets/default_user.png';
import logo from '../assets/logo.png';
import LikeButton, { fetchLikedTweets } from './Like_post.tsx';
import ReplyList from './ReplyList.tsx';
import ReplyForm from './ReplyForm.tsx';
import { MantineProvider, AppShell, Navbar, Header, Text, Input, Avatar, Container, Grid, Button, Center, Box, Textarea, useMantineTheme, Divider, Loader} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MyProfile_setting from './MyProfile_setting.tsx';

interface Tweet {
  tweetid: string;
  username: string;
  time: string;
  content: string;
  like: number;
  isLiked: boolean;
  replyCount: number;
}

const Post_App: React.FC = () => {
  const [profileData, setProfileData] = useState<{ name: string; age: number; username: string; avatar_url: string;} | null>(null);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [userLoading, setuserLoading] = useState<string | null>(null);
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [likedTweets, setLikedTweets] = useState<string[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState<boolean>(true);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const isMobile = useMediaQuery(`(max-width: ${767}px)`);
  const isMobilePost = useMediaQuery(`(max-width: ${970}px)`);
  const [follownumber, setFollowNumber] = useState<number | null>(0)

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

    const fetchAvatarURL = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data.avatar_url !== ""){
          setAvatarURL(`https://hackathon-ro2txyk6rq-uc.a.run.app${data.avatar_url}`);
        } else {
          setAvatarURL(defaultAvatar);
        }
      } catch (error) {
        console.error('Failed to fetch avatar URL:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowedTweets = async () => {
      try {
        setTweetsLoading(true);
        if (fireAuth.currentUser) {
          const likedTweetsData = await fetchLikedTweets(fireAuth.currentUser.uid);
          setLikedTweets(likedTweetsData);

          const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchfollow?followuser=${fireAuth.currentUser?.uid}`);
          const data = await response.json();
          setFollowNumber(data.length)
          if (data) {
            const tweets: Tweet[] = [];
            for (let i = 0; i < data.length; i++) {
              const tweetsResponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${data[i].followeruid}`);
              const tweetsData = await tweetsResponse.json();
              tweets.push(...tweetsData.map((tweet: any) => ({
                tweetid: tweet.tweetid,
                username: tweet.username,
                time: tweet.time,
                content: tweet.content,
                like: tweet.like,
                isLiked: likedTweetsData.includes(tweet.tweetid),
                replyCount: tweet.replyCount || 0,
              })));
            }
            const myresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${fireAuth.currentUser?.uid}`);
            const mydata = await myresponse.json();
            if (mydata) {
              const myTweets = mydata.map((tweet: any) => ({
                tweetid: tweet.tweetid,
                username: tweet.username,
                time: tweet.time,
                content: tweet.content,
                like: tweet.like,
                isLiked: likedTweetsData.includes(tweet.tweetid),
                replyCount: tweet.replyCount || 0,
              }));
              tweets.push(...myTweets);
            }
            tweets.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            setAllTweets(tweets);
          }
        }
      } catch (error) {
        console.error('Failed to fetch followed tweets:', error);
      }finally {
        setTweetsLoading(false); // ツイートの読み込み終了
      }
    };

    fetchUserProfile();
    fetchAvatarURL();
    fetchFollowedTweets();
  }, []);

  const handleLikeChange = (tweetid: string, isLiked: boolean, likeCount: number) => {
    setLikedTweets(prev => isLiked ? [...prev, tweetid] : prev.filter(id => id !== tweetid));
    setAllTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.tweetid === tweetid ? { ...tweet, like: likeCount, isLiked } : tweet
      )
    );
  };

  const debouncedSearch = useCallback(debounce(async (query: string) => {
    if (query.length > 0) {
      const response = await fetch(
        `https://hackathon-ro2txyk6rq-uc.a.run.app/searchUsers?username=${query}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(data);
        setNoResults(false);
      } else {
        setSearchResults([]);
        setNoResults(true);
      }
    } else {
      setSearchResults([]);
      setNoResults(false);
    }
  }, 300), []);

  useEffect(() => {
    if (searchTerm === '') {
      setSearchResults([]);
      setNoResults(false);
    }
  }, [searchTerm]);

  const createPost = async (content: string) => {
    return new Promise<void>(async (resolve, reject) => {
      const firebaseUID = fireAuth.currentUser?.uid;
      let errormessage = "";
      if (!content) {
        alert("tweet is empty");
        errormessage = "tweet is empty";
      }
      if (errormessage) {
        console.log(errormessage);
        reject(errormessage);
        return;
      }
      try {
        const response = await fetch(
          "https://hackathon-ro2txyk6rq-uc.a.run.app/post",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: profileData?.username,
              content: content,
              uid: firebaseUID,
              like: 0,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to tweet:", errorData);
          alert("failed to tweet");
          errormessage = "failed to tweet";
          reject(errormessage);
          return;
        } else {
          const newTweet = {
            tweetid: "",
            username: profileData?.username || "",
            time: new Date().toISOString(),
            content: content,
            like: 0,
            isLiked: false,
            replyCount: 0,
          };
          setAllTweets(prevTweets => [newTweet, ...prevTweets]);
          resolve();
        }
      } catch (error) {
        console.error("failed tweet", error);
        alert("failed tweet");
        reject(error);
      }
    });
  };

  if (!profileData) {
    return <Center style={{ height: '100vh' }}>
              <Loader size="xl" />
            </Center>
  }

  if (loading) {
    return <Center style={{ height: '100vh' }}>
              <Loader size="xl" />
          </Center>
  }

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setuserLoading("loading");
    setSearchTerm(query);
    debouncedSearch(query);
    setuserLoading(null);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const handleUserClick = (uid: string) => {
    navigate(`/userProfile/${uid}`);
  };

  return (
    <MantineProvider theme={{ colorScheme: theme.colorScheme }}>
      <AppShell
        padding="md"
        header={
          <Header height={60} p="xs">
            <Grid justify="space-between" align="center">
              <Grid.Col span={2}>
                <img src={logo} style={{ width: '50px', height: '50px', cursor: 'pointer' }} alt="logo" />
              </Grid.Col>
            </Grid>
          </Header>
        }
        navbar={
          <Navbar width={{ base: isMobile ? 100 : 350 }} height={1000} p="xs" sx={{ overflowY: 'auto' }}>
          <Grid>
            <Grid.Col span={isMobile ? 12 : 5}>
              <Avatar
                src={avatarURL || defaultAvatar}
                alt="Profile"
                onClick={handleProfileClick}
                size={isMobile ? 50: 90}
                style={{ cursor: 'pointer' }}
              />
              <Text size='xl' weight={600} sx={{textAlign: "center"}}>{profileData?.username}</Text>
              <Text size={isMobile ? 'xs':'s'} weight={600} sx={{textAlign: "center"}}>フォロー数：{follownumber}</Text>
            </Grid.Col>
            <Grid.Col span={isMobile ? 9 : 7}>
            <Box mt="xs">
              <Grid.Col span={9}>
                <Input
                  type="text"
                  placeholder="ユーザーを検索"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{width: isMobile ? '300%' :  '100%' }}
                />
              </Grid.Col>
                {searchResults.map(user => (
                  <Box key={user.uid} onClick={() => handleUserClick(user.uid)} style={{ cursor: 'pointer' }}>
                    <Grid>
                    <Grid.Col span={4}>
                    <Avatar src={avatarURL} alt="Profile" size={50} radius="xl">
                    </Avatar>
                    </Grid.Col>
                    <Grid.Col span={4}>
                    <Text
                    weight={700}
                    sx={{
                    marginTop: 15}}
                    >
                      {user.username}
                      </Text>
                    </Grid.Col>
                    </Grid>
                  </Box>
                ))}
                {noResults && <Text weight={700}>該当無し</Text>}
              </Box>
            </Grid.Col>
          </Grid>
        </Navbar>
        }
      >
        <Container>
          <Grid>
            <Grid.Col span={12}>
              {tweetsLoading ? (
                <Center style={{ height: '100vh' }}>
                  <Loader size="xl" />
                </Center>
              ) : (
                allTweets.map((tweet: Tweet, index: number) => (
                  <Box key={index} mb="lg">
                    <Grid>
                      <Avatar src={defaultAvatar} alt="Profile" size={isMobile ? 50: 70} radius="xl" />
                      <Grid.Col span={2}>
                        <Text size='xl' weight={700}>{tweet.username}</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Text size="md" color="gray">{formatDateTime(tweet.time)}</Text>
                      </Grid.Col>
                      </Grid>

                      <Grid>
                      <Grid.Col span={8}>
                        <Text size="xl" weight={600}
                        sx={{textAlign: "center"}}>
                          {tweet.content}
                          </Text>
                      </Grid.Col>
                    </Grid>

                    <Grid>
                    <Grid.Col
                    sx={{textAlign: 'center'}}
                    span={6}>
                        <LikeButton
                          tweetid={tweet.tweetid}
                          initialLike={tweet.like}
                          initialIsLiked={tweet.isLiked}
                          onLikeChange={handleLikeChange}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                    <ReplyList tweetId={tweet.tweetid} />
                    {showReplyForm === tweet.tweetid && (
                      <ReplyForm
                        tweetId={tweet.tweetid}
                        onReplyPosted={() => setShowReplyForm(null)}
                      />
                    )}
                    </Grid.Col>
                    </Grid>
                    <Divider my="sm" />
                  </Box>
                ))
              )}
            </Grid.Col>
          </Grid>
        </Container>
        <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '60%',
          padding: '10px',
        }}>
          <Grid>
            <Grid.Col span={8}>
              <Textarea
                placeholder="What's happening?"
                value={replyContent}
                onChange={(e) => setReplyContent(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={isMobile ? 3:2}>
              <Button
              color='lime'
              sx={{padding: 0,height: isMobilePost ? 40:50,fontSize: 20}}
              fullWidth onClick={() => createPost(replyContent)}>
                Post
              </Button>
            </Grid.Col>
          </Grid>
        </Box>
      </AppShell>
    </MantineProvider>
  );
};

export default Post_App;
