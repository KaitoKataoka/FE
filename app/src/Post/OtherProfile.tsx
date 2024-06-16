import React,{useState, useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import defaultAvatar from '../assets/default_user.png';
import { fireAuth } from '../firebase.ts';

const OtherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [OtherTweetData, setOtherTweetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [defaultuser, setDefaultuser] = useState<string | null>(defaultAvatar);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (uid) {
      fetchOtherUserProfile(uid);
      handleOtherTweet(uid);
      handleOtherAvatar(uid);
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
      setAvatarURL(defaultAvatar);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch avatar URL:', error);
      setLoading(false);
    }
  };


  const handleRegisterFollow = async() => {
    try{
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
    }
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
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="otherprofile">
      <button onClick={handleBackClick} style={{ fontSize: '20px' }}>←</button>
      <img src={avatarURL || defaultAvatar} alt="otherProfile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
      <p>名前: {otherProfile.name}</p>
      <p>年齢: {otherProfile.age}</p>
      <p>ユーザー名: {otherProfile.username}</p>
      {isFollowing ? (
        <button onClick={handleUnfollow} disabled={loading} style={{ fontSize: '20px' }}>フォロー解除</button>
      ) : (
        <button onClick={handleRegisterFollow} disabled={loading} style={{ fontSize: '20px' }}>フォロー</button>
      )}
      <table>
        <thead>
          <tr>
            <th>ポスト</th>
          </tr>
        </thead>
        <tbody>
          {OtherTweetData && OtherTweetData.map((tweet: any, index: number) => (
            <th>
            <tr key={index}>
              <td>{otherProfile.username}</td>
              <td>{formatDateTime(tweet.time)}</td>
            </tr>
            <td>{tweet.content}</td>
            </th>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default OtherProfile;