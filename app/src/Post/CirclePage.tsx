import { fireAuth } from '../firebase.ts';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MantineProvider, AppShell, Navbar, Header, Text, Input, Avatar, Container, Grid, Button, Center, Box, Textarea, useMantineTheme, Divider, Loader, FileInput, Image, Card, Title, ScrollArea} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import defaultAvatar from '../assets/default_user.png';
import HashtagText from './Hashtag.tsx';
import LikeCircleButton from './Like_circlepost.tsx';
import ReplyList from './ReplyList.tsx';
import { IconPhoto, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { fetchLikedTweets } from './Like_post.tsx';

interface CircleTweet {
  circleid: string;
  tweetid: string;
  username: string;
  time: string;
  content: string;
  uid: string;
  like: number;
  isLiked: boolean;
  replyCount: number;
  avatar_url: string;
  image?: string;
}

interface MyProfileProps {
  profileData: { name: string; age: number; username: string; avatar: string };
}

const CirclePage: React.FC<MyProfileProps> = ({ profileData }) => {
  const { circleid } = useParams<{ circleid: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMember, setIsMember] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageOk, setImageOk] = useState<boolean>(false);
  const [allTweets, setAllTweets] = useState<CircleTweet[]>([]);
  const [replyContent, setReplyContent] = useState<string>('');
  const isMobile = useMediaQuery(`(max-width: 767px)`);
  const isMobilePost = useMediaQuery(`(max-width: 970px)`);
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [tweetSearchTerm, setTweetSearchTerm] = useState<string>('');
  const [likedTweets, setLikedTweets] = useState<string[]>([]);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [tweetsLoading, setTweetsLoading] = useState<boolean>(true);

  const [circlepostid, setcirclepostid] = useState<string | null>(null);

  useEffect(() => {
    const fetchCircleDetails = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/getcircle?uid=${fireAuth.currentUser?.uid}`);
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
              if (circleid === data[i].circleid) {
                setIsMember(true);
                if (data[i].creater === fireAuth.currentUser?.uid) {
                  setIsCreator(true);
                }
            }
          }
        }
      }
      }catch (error) {
        console.log(error);
      }
    };

    const fetchAvatarURL = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data.avatar_url !== ""){
          console.log(data.avatar_url)
          setAvatarURL(data.avatar_url);
        } else {
          setAvatarURL(defaultAvatar);
        }
      } catch (error) {
        console.error('Failed to fetch avatar URL:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCircle = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchcircleid?uid=${fireAuth.currentUser?.uid}`);
        if (response.ok) {
          const data = await response.json();
          if(data[0].circleid == circleid){
            setIsMember(true)
          }
        }
      } catch (err) {
        setError('サークルの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCircle();
    fetchAvatarURL();
    fetchCircleTweets();
    fetchCircleDetails();
  }, [circleid]);

  const fetchCircleTweets = async () => {
    try {
        setTweetsLoading(true);
        if (fireAuth.currentUser) {
            const likedTweetsData = await fetchLikedTweets(fireAuth.currentUser.uid);
            setLikedTweets(likedTweetsData);

            const avatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
            const avatardata = await avatarresponse.json();
            if (avatardata.avatar_url !== ""){
                setAvatarURL(avatardata.avatar_url);
            } else {
                setAvatarURL(defaultAvatar);
            }

            const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/getcircletweet?circleid=${circleid}`);
            if (response.ok) {
                const data = await response.json();
                if(data){
                    const newTweets = data.map((tweet: any) => ({
                        circleid: tweet.circleid,
                        tweetid: tweet.tweetid,
                        username: tweet.username,
                        time: tweet.time,
                        content: tweet.content,
                        uid: tweet.uid,
                        like: tweet.like,
                        isLiked: likedTweetsData && likedTweetsData.includes(tweet.tweetid),
                        replyCount: tweet.replyCount || 0,
                        avatar_url: avatardata.avatar_url || defaultAvatar,
                        image: tweet.image
                    }));
                    newTweets.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                    setAllTweets(newTweets);  // 全ツイートを一度に設定
                }
            }
        }
    } catch (err) {
        setError('サークルの取得に失敗しました');
    } finally {
        setTweetsLoading(false); // ツイートの読み込み終了
    }
};


  const handleCircleRegister = async () => {
    try {
      const response = await fetch('https://hackathon-ro2txyk6rq-uc.a.run.app/postcirclemember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ circleID: circleid, uid: fireAuth.currentUser?.uid }),
      });

      if (response.ok) {
        setSuccess('サークルに加入しました');
        setError('');
        setIsMember(true); // 加入後に脱退ボタンを表示
      } else {
        const result = await response.json();
        setError(result.message || 'サークルの加入に失敗しました');
        setSuccess('');
      }
    } catch (err) {
      setError('サークルの加入に失敗しました');
      setSuccess('');
    }
  };

  const handleCircleUnregister = async () => {
    try {
      const response = await fetch('https://hackathon-ro2txyk6rq-uc.a.run.app/stopcircle', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ circleid: circleid, uid: fireAuth.currentUser?.uid }),
      });

      if (response.ok) {
        setSuccess('サークルを脱退しました');
        setError('');
        setIsMember(false); // 脱退後に加入ボタンを表示
      } else {
        const result = await response.json();
        setError(result.message || 'サークルの脱退に失敗しました');
        setSuccess('');
      }
    } catch (err) {
      setError('サークルの脱退に失敗しました');
      setSuccess('');
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
      setTweetImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setTweetImage(null);
      setImagePreview(null);
    }
  };

  const createPost = async (content: string) => {
    setImageOk(true);
    const firebaseUID = fireAuth.currentUser?.uid;
    if (!content) {
      content = "";
    }
    try {
      let image_url = "";
      if (tweetImage) {
        image_url = await uploadImageAndGetUrl(tweetImage);
      }

      const avatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${firebaseUID}`);
      const avatarData = await avatarresponse.json();

      // サークル内のツイートを作成
      const circlePostResponse = await fetch(
        "https://hackathon-ro2txyk6rq-uc.a.run.app/circlepost",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            circleid: circleid,
            username: profileData?.username,
            content: content,
            uid: firebaseUID,
            like: 0,
            image: image_url,
          }),
        }
      );

      if (!circlePostResponse.ok) {
        const errorData = await circlePostResponse.json();
        console.error("Failed to post to circle:", errorData);
        alert("Failed to post to circle");
        return;
      }

      const newTweet: CircleTweet = {
        circleid: circleid || "",
        tweetid: "", // 通常のツイートIDを追加
        username: profileData?.username || "",
        time: new Date().toISOString(),
        content: content,
        uid: firebaseUID || "",
        like: 0,
        isLiked: false,
        replyCount: 0,
        avatar_url: avatarData.avatar_url || "",
        image: image_url || ""
      };
      setAllTweets(prevTweets => [newTweet, ...prevTweets]);

      setTweetImage(null);
      setReplyContent("");
      setImagePreview(null);
      setImageOk(false);
      fetchCircleTweets();
    } catch (error) {
      console.error("Failed to post:", error);
      alert("Failed to post");
      setImageOk(false);
    }
  };

  const handleTweetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTweetSearchTerm(e.target.value);
  };

  const filteredTweets = allTweets.filter(tweet =>
    tweet.content.toLowerCase().includes(tweetSearchTerm.toLowerCase())
  );


  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  const handleBackClick = () => {
    navigate("/");
  };

  const handleLikeChange = (tweetid: string, isLiked: boolean, likeCount: number) => {
    setLikedTweets(prev => isLiked ? [...prev, tweetid] : prev.filter(id => id !== tweetid));
    setAllTweets(prevTweets =>
      prevTweets.map(tweet =>
        tweet.tweetid === tweetid ? { ...tweet, like: likeCount, isLiked } : tweet
      )
    );
  };

  return (
    <MantineProvider theme={{ colorScheme: theme.colorScheme }}>
      <AppShell
        padding="md"
        header={
          <Header height={70} p="xs">
            <Grid justify="space-between" align="center">
              <Grid.Col span={2}>
              <Button onClick={handleBackClick} variant="outline" mb="md">←</Button>
              </Grid.Col>
              <Grid.Col span={7}>
                <Input
                  type="text"
                  placeholder="ツイートを検索"
                  value={tweetSearchTerm}
                  onChange={handleTweetSearch}
                  style={{ width: '80%', marginBottom: '20px' }}
                  icon={<IconSearch size={20} />}
                />
              </Grid.Col>
            </Grid>
          </Header>
        }
      >
        <Container>
  {isMember ? (
    <>
      {isCreator ? (
        <Text>あなたはこのサークルの作成者です</Text>
      ) : (
        <Button onClick={handleCircleUnregister} color="red">
          サークルを脱退
        </Button>
      )}
      {tweetsLoading ? (
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" />
        </Center>
      ) : (
        <>
          <Divider my="sm" />
          {allTweets.length > 0 ? (
            filteredTweets.slice().reverse().map((tweet: CircleTweet, index: number) => (
              <Box key={index} mb="lg">
                <Grid>
                  <Avatar src={avatarURL || defaultAvatar} alt="Profile" size={50} radius="xl" />
                  <Grid.Col span={2}>
                    <Text size='xl' weight={700}>{tweet.username}</Text>
                  </Grid.Col>
                  <Grid.Col span={9}>
                    <Text size="md" color="gray">{formatDateTime(tweet.time)}</Text>
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {tweet.image && <Image src={tweet.image} style={{ maxWidth: '30%', height: 'auto' }} alt="Tweet Image" />}
                    <HashtagText text={tweet.content} />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col sx={{ textAlign: 'center' }} span={6}>
                    <LikeCircleButton
                      tweetid={tweet.tweetid}
                      initialLike={tweet.like}
                      initialIsLiked={tweet.isLiked}
                      onLikeChange={handleLikeChange}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ReplyList tweetId={tweet.tweetid} onHashtagsExtracted={() => { }} />
                  </Grid.Col>
                </Grid>
                <Divider my="sm" />
              </Box>
            ))
          ) : (
            <Text>ツイートがまだありません</Text>
          )}
        </>
      )}
    </>
  ) : (
    <Container>
            <Button onClick={handleCircleRegister}>サークルに加入</Button>
            <Text align='center' weight={600}>Circleに参加してツイートを見ましょう!</Text>
            </Container>
  )}
</Container>

        {isMember ? (
        <Box
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  width: '60%',
                  padding: '10px',
                }}
              >
                {imagePreview && <Image src={imagePreview} style={{ maxWidth: '30%', height: 'auto' }} alt="Profile Preview" radius="md" />}
                <Grid>
                  <Grid.Col span={7}>
                    <Textarea
                      placeholder="今どうしてる?"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <FileInput
                      onChange={handleImageChange}
                      accept="image/*"
                      icon={<IconPhoto size={27} />}
                      style={{ width: '5%', marginTop: "10px" }}
                    />
                  </Grid.Col>
                  <Grid.Col span={isMobile ? 3 : 2}>
                    <Button
                      color='lime'
                      sx={{ padding: 0, height: isMobilePost ? 40 : 50, fontSize: 20 }}
                      fullWidth onClick={() => createPost(replyContent)}
                      disabled={imageOk || (!replyContent && !tweetImage)}
                    >
                      Post
                    </Button>
                  </Grid.Col>
                </Grid>
              </Box>
        ) : (
          <></>
        )
              }
      </AppShell>
    </MantineProvider>  );
};

export default CirclePage;
