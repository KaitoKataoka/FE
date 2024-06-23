import { fireAuth } from '../firebase.ts';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import "./Post_App.css";
import defaultAvatar from '../assets/default_user.png';
import logo from '../assets/logo2.png';
import LikeButton, { fetchLikedTweets } from './Like_post.tsx';
import ReplyList from './ReplyList.tsx';
import ReplyForm from './ReplyForm.tsx';
import { MantineProvider, AppShell, Navbar, Header, Text, Input, Avatar, Container, Grid, Button, Center, Box, Textarea, useMantineTheme, Divider, Loader, FileInput, Image, Card, Title, ScrollArea} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { IconPhoto } from '@tabler/icons-react';
import HashtagText from './Hashtag.tsx';
import HashtagRanking from './Hashtag_ranking.tsx';
import { IconSearch } from '@tabler/icons-react';
import CircleCreateForm from './CircleForm.tsx';
import CircleList from './CircleList.tsx';
import { IconCrown } from '@tabler/icons-react';




interface Tweet {
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
  const [tweetSearchTerm, setTweetSearchTerm] = useState<string>('');
  const [likedTweets, setLikedTweets] = useState<string[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState<boolean>(true);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const isMobile = useMediaQuery(`(max-width: ${767}px)`);
  const isMobilePost = useMediaQuery(`(max-width: ${970}px)`);
  const [follownumber, setFollowNumber] = useState<number | null>(0)
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageOk, setImageOk] = useState<boolean>(false);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // トリガーの状態
  const [searchCircleTerm, setCircleSearchTerm] = useState('');
  const [searchCircleResults, setCircleSearchResults] = useState<any[]>([]);
  const [noCircleResults, setCircleNoResults] = useState(false);
  const isMobile2 = useMediaQuery(`(max-width: ${1050}px)`);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[^\s#]+/g;
    return text.match(hashtagRegex) || [];
  };

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

    const fetchfollownumber = async() => {
      const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchfollow?followuser=${fireAuth.currentUser?.uid}`);
      const data = await response.json();
      if(data){
      setFollowNumber(data.length)
      }
    }



    fetchfollownumber();
    fetchUserProfile();
    fetchFollowedTweets();
    fetchAvatarURL();
  }, []);


  const fetchFollowedTweets = async () => {
    try {
      setTweetsLoading(true);
      if (fireAuth.currentUser) {
        const likedTweetsData = await fetchLikedTweets(fireAuth.currentUser.uid);
        setLikedTweets(likedTweetsData);

        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchopenfollow?followuser=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data) {
          for (let i =0; i<data.length; i++){
            if(data[i].followeruid == fireAuth.currentUser?.uid){
              data[i].followeruid = null
            }
          }
            for (let i = 0; i<data.length; i++){
              for (let u = i + 1; u<data.length; u++){
                if (data[i].followeruid == data[u].followeruid){
                  data[i].followeruid = null
                }
              }
            }

            console.log(data)
          const tweets: Tweet[] = [];
          for (let i = 0; i < data.length; i++) {
            const tweetsResponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${data[i].followeruid}`);
            console.log(data)
            const tweetsData = await tweetsResponse.json();
            console.log(tweetsData)
            const avatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${data[i].followeruid}`);
          const avatardata = await avatarresponse.json();
            if(tweetsData){
            tweets.push(...tweetsData.map((tweet: any) => ({
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
            })));}
          }

          const myavatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
          const myavatardata = await myavatarresponse.json();

          const myresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${fireAuth.currentUser?.uid}`);
          const mydata = await myresponse.json();
          console.log(mydata)
          if (mydata) {
            const myTweets = mydata.map((tweet: any) => ({
              tweetid: tweet.tweetid,
              username: tweet.username,
              time: tweet.time,
              content: tweet.content,
              uid: tweet.uid,
              like: tweet.like,
              isLiked: likedTweetsData && likedTweetsData.includes(tweet.tweetid),
              replyCount: tweet.replyCount || 0,
              avatar_url: myavatardata.avatar_url,
              image: tweet.image
            }));
            tweets.push(...myTweets);
          }
          tweets.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setAllTweets(tweets);

          const allHashtags = tweets.flatMap(tweet => extractHashtags(tweet.content));
          setAllHashtags(allHashtags);
        }
      }
    } catch (error) {
      console.error('Failed to fetch followed tweets:', error);
    }finally {
      setTweetsLoading(false); // ツイートの読み込み終了
    }
  };

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

  const debouncedcircleSearch = useCallback(debounce(async (query: string) => {
    if (query.length > 0) {
      const response = await fetch(
        `https://hackathon-ro2txyk6rq-uc.a.run.app/searchcircle?circlename=${query}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCircleSearchResults(data);
        setNoResults(false);
      } else {
        setCircleSearchResults([]);
        setCircleNoResults(true);
      }
    } else {
      setSearchResults([]);
      setCircleNoResults(false);
    }
  }, 300), []);

  useEffect(() => {
    if (searchTerm === '') {
      setSearchResults([]);
      setNoResults(false);
    }
    if (searchCircleTerm === ""){
      setCircleSearchResults([]);
      setCircleNoResults(false);
    }
  }, [searchTerm, searchCircleTerm]);

  const handleTweetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTweetSearchTerm(e.target.value);
  };

  const filteredTweets = allTweets.filter(tweet =>
    tweet.content.toLowerCase().includes(tweetSearchTerm.toLowerCase())
  );

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
    setImageOk(true)
    return new Promise<void>(async (resolve, reject) => {
      const firebaseUID = fireAuth.currentUser?.uid;
      let errormessage = "";
      if (!content) {
        content=""
      }
      if (errormessage) {
        console.log(errormessage);
        reject(errormessage);
        return;
      }
      try {
        let image_url = "";
        if (tweetImage) {
          image_url = await uploadImageAndGetUrl(tweetImage);
        }

        const avatarresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
        const data = await avatarresponse.json();
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
              image: image_url,
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
            uid: "",
            like: 0,
            isLiked: false,
            replyCount: 0,
            avatar_url: data.avatar_url,
            image: ""
          };
          setAllTweets(prevTweets => [newTweet, ...prevTweets]);
          setTweetImage(null);
          setImagePreview(null);
          setReplyContent("");
          setImageOk(false)
          resolve();
        }
      } catch (error) {
        console.error("failed tweet", error);
        alert("failed tweet");
        setImageOk(false)
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

  const handleCircleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setuserLoading("loading");
    setCircleSearchTerm(query);
    debouncedcircleSearch(query);
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

  const handleCircleClick = (circleid: string) => {
    navigate(`/circle/${circleid}`);
  };

  const handlePostClick = async () => {
    await createPost(replyContent);
    // 新しいツイートを取得するための関数を呼び出します
    fetchFollowedTweets();
  };

  const handleHashtagsExtracted = (hashtags: string[]) => {
    setAllHashtags(prevHashtags => [...prevHashtags, ...hashtags]);
  };

  const handleCircleCreated = () => {
    setRefreshTrigger(!refreshTrigger); // トリガーを反転させて更新を促す
  };

  return (
    <MantineProvider theme={{ colorScheme: theme.colorScheme }}>
      <AppShell
        padding="md"
        header={
          <Header height={70} p="xs">
            <Grid justify="space-between" align="center">
              <Grid.Col span={2}>
                <img src={logo} style={{ width: '50px', height: '50px', cursor: 'pointer' }} alt="logo" />
              </Grid.Col>
              <Grid.Col span={7}>
              <Input
                type="text"
                placeholder="ツイートを検索"
                value={tweetSearchTerm}
                onChange={handleTweetSearch}
                style={{ width: '60%', marginBottom: '20px' }}
                icon={<IconSearch size={20} />}
              />
              </Grid.Col>
            </Grid>
          </Header>
        }
        navbar={
          <Navbar width={{ base: isMobile ?  100 : (isMobile2 ? 160 : 350) }} height={650} p="xs" sx={{ overflowY: 'auto' }}>
          <Grid>
            <Grid.Col span={isMobile? isMobile2 ? 12 : 8 : 5}>
              <Avatar
                src={avatarURL || defaultAvatar}
                alt="Profile"
                onClick={handleProfileClick}
                size={isMobile2 ? 50: 90}
                style={{ cursor: 'pointer' }}
                radius="xl"
              />
              <Text size='xl' weight={600} sx={{textAlign: "center"}}>{profileData?.username}</Text>
              <Text size={isMobile2 ? 'xs':'s'} weight={600} sx={{textAlign: "center"}}>フォロー：{follownumber}</Text>
            </Grid.Col>
            <Grid.Col span={isMobile ? 9 : 7}>
            <Box mt="xs">
              <Grid.Col span={9}>
                <Input
                  type="text"
                  placeholder="ユーザー検索"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{width: isMobile ? '300%' :  '100%' }}
                  icon={<IconSearch size={20} />}
                />
              </Grid.Col>
                {searchResults.map(user => (
                  <Box key={user.uid} onClick={() => handleUserClick(user.uid)} style={{ cursor: 'pointer' }}>
                    <Grid>
                    <Grid.Col span={4}>
                    <Avatar src={user.avatar_url} alt="Profile" size={50} radius="xl">
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
            <Grid.Col>
            <Input
                type="text"
                placeholder="サークルを検索"
                value={searchCircleTerm}
                onChange={handleCircleSearch}
                style={{ width: '60%', marginBottom: '20px' }}
                icon={<IconSearch size={20} />}
              />
              </Grid.Col>
              {searchCircleResults.map(circle => (
          <Box key={circle.circleid} style={{ cursor: 'pointer', marginBottom: '10px' }}>
            <Grid align="center" gutter="xs">
              <Grid.Col span="content">
              </Grid.Col>
              <Grid.Col span="auto">
                <Text
                  onClick={() => handleCircleClick(circle.circleid)}
                  weight={700}
                  sx={{ marginLeft: '10px' }}
                >
                    {circle.circlename}
                  </Text>
              </Grid.Col>
            </Grid>
            </Box>
              ))}

                {noCircleResults && <Text weight={700}>該当無し</Text>}
              <Grid.Col>
            <CircleList refreshTrigger={refreshTrigger} />
            </Grid.Col>
              <Grid.Col>
                </Grid.Col>
            <CircleCreateForm onCircleCreated={handleCircleCreated} />
          </Grid>
        </Navbar>
        }
      >
        <Container>
          <Grid>
            <Grid.Col span={9}>
              {tweetsLoading ? (
                <Center style={{ height: '100vh' }}>
                  <Loader size="xl" />
                </Center>
              ) : (
                <>
                {filteredTweets.map((tweet: Tweet, index: number) => (
                  <Box key={index} mb="lg">
                    <Grid>
                      <Avatar src={tweet.avatar_url || null} alt="Profile" onClick={() => handleUserClick(tweet.uid)} size={isMobile ? 50: 70} radius="xl" />
                      <Grid.Col span={2}>
                        <Text size='xl' weight={700}>{tweet.username}</Text>
                      </Grid.Col>
                      <Grid.Col span={9}>
                        <Text size="md" color="gray">{formatDateTime(tweet.time)}</Text>
                      </Grid.Col>
                      </Grid>

                      <Grid>
                      <Grid.Col span={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {tweet.image && <Image src={tweet.image}  style={{ maxWidth: '30%', height: 'auto'}} alt="Tweet Image" />}
                          <HashtagText text={tweet.content} />
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
                    <ReplyList tweetId={tweet.tweetid} onHashtagsExtracted={handleHashtagsExtracted}/>
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
                ))}
                </>
              )}
            </Grid.Col>
            <Grid.Col span={3}>
              <Card shadow="sm" p="lg">
                {isMobile ?  <IconCrown size={24} />:<Title order={2} align="center" mb="md" size={isMobile2 ?   (isMobile ? "xs":"s"):"lg"}>ランキング<IconCrown size={24} /></Title>}
                <ScrollArea style={{ height: '70vh' }}>
                  <HashtagRanking hashtags={allHashtags} />
                </ScrollArea>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>

        {imageOk ? (
          <Loader size="xl" />
        ):(
        <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '60%',
          padding: '10px',
        }}>
          {imagePreview && <Image src={imagePreview} style={{ maxWidth: '30%', height: 'auto'}} alt="Profile Preview" radius="md" />}
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
            <Grid.Col span={isMobile ? 3:2}>
              <Button
              color='lime'
              sx={{padding: 0,height: isMobilePost ? 40:50,fontSize: 20}}
              fullWidth onClick={() =>
                handlePostClick()
              }
              disabled={!replyContent && !tweetImage}>
                Post
              </Button>
            </Grid.Col>
          </Grid>
        </Box>
        )}
      </AppShell>
    </MantineProvider>
  );
};

export default Post_App;
