import React,{useState, useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultAvatar from '../assets/default_user.png';
import { fireAuth } from '../firebase.ts';
import { Box, Text, Button, Loader, Table, Container, Avatar, Paper, Title, Center, Image } from '@mantine/core';
import HashtagText from './Hashtag.tsx';

const OtherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [OtherTweetData, setOtherTweetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [defaultuser, setDefaultuser] = useState<string | null>(defaultAvatar);
  const [isFollowing, setIsFollowing] = useState(false);
  const [mybirthday, setMybirthday] = useState<string | null>(null);
  const [mycomment, setMycomment] = useState<string | null>(null);

  useEffect(() => {
    if (uid) {
      fetchOtherUserProfile(uid);
      handleOtherTweet(uid);
      handleOtherAvatar(uid);
      fetchOtherProfile(uid);
      if (fireAuth.currentUser?.uid){
      checkIfFollowing(uid);
      }
    }
  }, [uid]);

  const fetchOtherUserProfile = async (uid: string) => {
    const response = await fetch(
      `https://hackathon-ro2txyk6rq-uc.a.run.app/search?uid=${uid}`
    );
    const data = await response.json();
    console.log(data);
    if (data && data.length > 0) {
      setOtherProfile(data[0]);
    } else {
      setOtherProfile(null);
    }
  }

  const handleOtherTweet = async(uid: string) => {
    const response = await fetch(
      `https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${uid}`);
    const data = await response.json();
    console.log(data);
    if (data && data.length > 0) {
      setOtherTweetData(data);
    } else {
      setOtherTweetData(null); // データがない場合はnullを設定
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const handleOtherAvatar = async (uid: string) => {
    try {
      const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${uid}`);
      const data = await response.json();
      console.log(data.avatar_url)
      setAvatarURL(data.avatar_url);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch avatar URL:', error);
      setLoading(false);
    }
  };

  const fetchOtherProfile = async(uid: string) => {
    try {
      const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/getmyprofile?uid=${uid}`);
      const data = await response.json();
      setMybirthday(data[0].birthday)
      setMycomment(data[0].comment)
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch other profile', error);
      setLoading(false);
    }
  }


  const handleRegisterFollow = async() => {
    try{
      if (uid == fireAuth.currentUser?.uid){
        alert("自分のアカウントです")
      }
      else if (uid != fireAuth.currentUser?.uid) {
    const response = await fetch(
      "https://hackathon-ro2txyk6rq-uc.a.run.app/follow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followuid: fireAuth.currentUser?.uid,
          followeruid: uid,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
    console.error("Failed to follow:", errorData);
      alert("failed to follow");
      return;
    } else {
      console.log(uid);
      setIsFollowing(true);
    }}
  } catch (error) {
    console.error("failed follow", error);
    alert("failed follow");
  }
}

const handleUnfollow = async () => {
  try {
    const response = await fetch(
      "https://hackathon-ro2txyk6rq-uc.a.run.app/unfollow",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followuid: fireAuth.currentUser?.uid,
          followeruid: uid,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to unfollow:", errorData);
      alert("failed to unfollow");
      return;
    } else {
      console.log(uid);
      setIsFollowing(false);
    }
  } catch (error) {
    console.error("failed unfollow", error);
    alert("failed unfollow");
  }
};

const checkIfFollowing = async (uid: string) => {
  try {
    const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchfollow?followuser=${fireAuth.currentUser?.uid}`);
    const data = await response.json();
    console.log(data)
    if (data) {
      const isFollowing = data.some((follower: { followeruid: string }) => follower.followeruid === uid);
      setIsFollowing(isFollowing);
    }
  } catch (error) {
    console.error('Failed to check follow status:', error);
  }
}

  const handleBackClick = () => {
    navigate("/");
  };

  if (!otherProfile) {
    return <Center style={{ height: '100vh' }}>
              <Loader size="xl" />
            </Center>
  }

  if (loading) {
    return <Center style={{ height: '100vh' }}>
              <Loader size="xl" />
            </Center>
  }

  return (
    <Container>
      <Button onClick={handleBackClick} style={{ fontSize: '20px' }}>←</Button>
      <Paper shadow="xs" p="md">
      <Box display="flex" style={{textAlign: "center"}} mb="md">
      <Avatar src={avatarURL} alt="Profile" size={100} radius="xl">
      </Avatar>
      <Box ml="md">
      <Title>{otherProfile.username}</Title>
      {mybirthday && <Text>誕生日：{mybirthday}</Text>}
      <Text>{mycomment}</Text>
      </Box>
      </Box>
      {isFollowing ? (
        <Button onClick={handleUnfollow} disabled={loading} color='red'>フォロー解除</Button>
      ) : (
        <Button onClick={handleRegisterFollow} disabled={loading} color='indigo'>フォロー</Button>
      )}
      </Paper>
      <Table mt="md" highlightOnHover>
        <thead>
          <tr>
            <th>ポスト</th>
          </tr>
        </thead>
        <tbody>
          {OtherTweetData && OtherTweetData.slice().reverse().map((tweet: any, index: number) => (
            <tr key={index}>
              <td>
              <Text
              size='s'>
                {otherProfile.username}
                </Text>
              <Text
              size='s'
              color='gray'
              >
                {formatDateTime(tweet.time)}
                </Text>
                {tweet.image && <Image src={tweet.image} style={{ maxWidth: '30%', height: 'auto'}} alt="Tweet Image"/>}
                <HashtagText text={tweet.content} />
              </td>
            </tr>
          ))}
        </tbody>
        </Table>
    </Container>
  );
}
export default OtherProfile;