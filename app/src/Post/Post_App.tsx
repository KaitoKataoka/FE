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
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
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

  const handleReplyPosted = (tweetId: string) => {
    setShowReplyForm(null);
    // 任意の処理
  };

  const handleReplyButtonClick = (tweetId: string) => {
    setShowReplyForm(tweetId);
  };

  return (
    <div>
      <h1><img src={logo} style={{ width: '200px', height: '150px', cursor: 'pointer', borderRadius: '50%' }} /></h1>
      {userLoading ? (
        <div>loading...</div>
      ) : (
        <></>
      )}
      <input
        type="text"
        placeholder="ユーザーネームを検索"
        value={searchTerm}
        onChange={handleSearch}
        style={{ width: '50%', margin: '0 auto', display: 'block' }}
      />
      <div>
        {searchResults.map(user => (
          <div key={user.uid} onClick={() => handleUserClick(user.uid)} style={{ cursor: 'pointer' }}>
            <p><img src={defaultAvatar} alt="Profile" onClick={handleProfileClick} style={{ width: '100px', height: '100px', cursor: 'pointer', borderRadius: '50%' }} />{user.username}</p>
          </div>
        ))}
        {noResults && <p>該当無し</p>}
      </div>
      <table>
        <thead>
          <tr>
            <th>ポスト</th>
          </tr>
        </thead>
        <tbody>
          {tweetsLoading ? ( // ツイートが読み込み中かどうかをチェック
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td>
            </tr>
          ) : (
            allTweets && allTweets.map((tweet: Tweet, index: number) => (
              <tr key={index}>
                <td>{tweet.username}</td>
                <td>{formatDateTime(tweet.time)}</td>
                <td>{tweet.content}</td>
                <td>
                  <LikeButton
                    tweetid={tweet.tweetid}
                    initialLike={tweet.like}
                    initialIsLiked={tweet.isLiked}
                    onLikeChange={handleLikeChange}
                  />
                </td>
                <td>
                  <button onClick={() => handleReplyButtonClick(tweet.tweetid)}>返信</button>
                </td>
                <td>
                  {showReplyForm === tweet.tweetid && (
                    <ReplyForm
                      tweetId={tweet.tweetid}
                      userName={profileData?.username || ''}
                      onReplyPosted={() => setShowReplyForm(null)}
                    />
                  )}
                </td>
                <td>
                  <ReplyList tweetId={tweet.tweetid} onReplyPosted={() => handleReplyPosted(tweet.tweetid)}/>
                </td>{/* 返信機能を追加 */}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="sidebar">
        <img src={avatarURL || defaultAvatar} alt="Profile" onClick={handleProfileClick} style={{ width: '100px', height: '100px', cursor: 'pointer', borderRadius: '50%' }} />
      </div>
      <Contentform onNewPost={createPost} />
    </div>
  );
};

export default Post_App;
