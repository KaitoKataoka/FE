// src/Post/MyProfile.tsx
import React,{useState, useEffect} from 'react';
import { fireAuth } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Paper, Table, Text, Title, Container, Center, Loader } from '@mantine/core';
import defaultAvatar from "../assets/default_user.png";

interface MyProfileProps {
  profileData: { name: string; age: number; username: string; avatar: string };
}


const MyProfile_setting: React.FC<MyProfileProps> = ({ profileData }) => {
  const navigate = useNavigate();
  const [MyTweetData, setMyTweetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [follownumber, setFollowNumber] = useState<number | null>(0);
  const [isopen, setIsOpen] = useState(false)

  useEffect(() => {
    handleMyTweet();
    const fetchAvatarURL = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data.avatar_url != ""){
        setAvatarURL(data.avatar_url);
        if (profileData) {
          setLoading(false);
        }
        }else{
        setAvatarURL(defaultAvatar);
        if (profileData) {
          setLoading(false);
        }
        }
      } catch (error) {
        console.error('Failed to fetch avatar URL:', error);
        setLoading(false);
      }
    };

    const fetchFollows = async () => {
      if (fireAuth.currentUser) {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchfollow?followuser=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data) {
          console.log(data)
        setFollowNumber(data.length)
        };
      }
    }

    const fetchOpen = async () => {
      const response = await fetch('https://hackathon-ro2txyk6rq-uc.a.run.app/getopen');
      const data = await response.json();
      if(data) {
        for (let i = 0; i <data.length; i ++){
          console.log(data[i])
          if (data[i].followeruid == fireAuth.currentUser?.uid){
            console.log(data[i])
            setIsOpen(true)
          }
        }
      }
    }

    fetchOpen()
    fetchFollows()
    fetchAvatarURL();
  }, [profileData]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleMyTweet = async() => {
    const response = await fetch(
      `https://hackathon-ro2txyk6rq-uc.a.run.app/mytweet?uid=${fireAuth.currentUser?.uid}`);
    const data = await response.json();
    console.log(data);
    if (data && data.length > 0) {
      setMyTweetData(data);
    } else {
      setMyTweetData(null); // データがない場合はnullを設定
    }
  }

  const signOutWithGoogle = (): void => {
    signOut(fireAuth).then(() => {
      alert("ログアウトしました");
    }).catch(err => {
      alert(err);
    });
  };

  const handleopen = async() => {
    try{
      const response = await fetch(
        "https://hackathon-ro2txyk6rq-uc.a.run.app/postopen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: fireAuth.currentUser?.uid,
          }),
        }
      );if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to open:", errorData);
        alert("failed to open");
        return;
      }else{
        setIsOpen(true);
      }
    }catch(error){
      console.error("failed open", error);
      alert("failed open");
    }
  }

  if (loading) {
    return <Center style={{ height: '100vh' }}>
            <Loader size="xl" />
          </Center>
  }

  const handledeleteopen = async() => {
    try {
      const response = await fetch(
        "https://hackathon-ro2txyk6rq-uc.a.run.app/deleteopen",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: fireAuth.currentUser?.uid,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to unopen:", errorData);
        alert("failed to unopen");
        return;
      }else{
        setIsOpen(false);
      }
    } catch (error) {
      console.error("failed unopen", error);
      alert("failed unopen");
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <Container>
      <Button onClick={handleBackClick} variant="outline" mb="md">←</Button>
      <Paper shadow="xs" p="md">
        <Box display="flex" style={{textAlign: "center"}} mb="md">
          <Avatar src={avatarURL} alt="Profile" size={100} radius="xl">
            {!avatarURL && profileData.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box ml="md">
            <Title order={2}>{profileData.username}</Title>
            <Text>{profileData.age}歳</Text>
            <Text>フォロー数：{follownumber}</Text>
          </Box>
          {isopen ? (
        <Button onClick={handledeleteopen} variant="outline" disabled={loading} color='red'>ツイートを非公開</Button>
      ) : (
        <Button onClick={handleopen} disabled={loading} color='cyan'>ツイートを公開</Button>
      )}
        </Box>
        <Button onClick={signOutWithGoogle} variant="outline" color="red">ログアウト</Button>
      </Paper>
      <Table mt="md" highlightOnHover>
        <thead>
          <tr>
            <th>ポスト</th>
          </tr>
        </thead>
        <tbody>
          {MyTweetData && MyTweetData.map((tweet: any, index: number) => (
            <tr key={index}>
              <td>
                <Text
                color='gray'
                >
                  {formatDateTime(tweet.time)}</Text>
                <Text>{tweet.content}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
    );
  };

export default MyProfile_setting;
