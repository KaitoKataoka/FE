// src/Post/MyProfile.tsx
import React,{useState, useEffect} from 'react';
import { fireAuth } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../assets/default_user.png';

interface MyProfileProps {
  profileData: { name: string; age: number; username: string; avatar: string };
}

const MyProfile_setting: React.FC<MyProfileProps> = ({ profileData }) => {
  const navigate = useNavigate();
  const [MyTweetData, setMyTweetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);

  useEffect(() => {
    handleMyTweet();
    const fetchAvatarURL = async () => {
      try {
        const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchAvatar?uid=${fireAuth.currentUser?.uid}`);
        const data = await response.json();
        if (data.avatar_url != ""){
        setAvatarURL(`https://hackathon-ro2txyk6rq-uc.a.run.app${data.avatar_url}`);
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

  if (loading) {
    return <div>Loading...</div>;
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
      <div className="profile">
        <button onClick={handleBackClick} style={{ fontSize: '20px' }}>←</button>
        <img src={avatarURL || '/uploads/default-avatar.png'} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
        <p>名前: {profileData.name}</p>
        <p>年齢: {profileData.age}</p>
        <p>ユーザー名: {profileData.username}</p>
        <button onClick={signOutWithGoogle}>ログアウト</button>
        <table>
          <thead>
            <tr>
              <th>ポスト</th>
            </tr>
          </thead>
          <tbody>
            {MyTweetData && MyTweetData.map((tweet: any, index: number) => (
              <th>
              <tr key={index}>
                <td>{profileData.username}</td>
                <td>{formatDateTime(tweet.time)}</td>
              </tr>
              <td>{tweet.content}</td>
              </th>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

export default MyProfile_setting;
