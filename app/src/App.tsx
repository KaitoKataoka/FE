import React, { useState, useEffect } from 'react';
import {fireAuth} from './firebase.ts';
import { User } from 'firebase/auth';
import ProfileSetup from './Profile/Profilesetup.tsx';
import Signup_in_App from './Signup_in/Signup_in_App.tsx';
import Post_App from './Post/Post_App.tsx';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import MyProfile_setting from './Post/MyProfile_setting.tsx';
import OtherProfile from './Post/OtherProfile.tsx';
import {Loader, Center} from '@mantine/core';


export interface Post {
  id: string;
  content: string;
  likes: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileComplete, setProfileComplete] = useState<any>(null);
  const [loading, setloading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = fireAuth.onAuthStateChanged(async user => {
      setUser(user);
      if (user) {
        handleAuthSuccess();
      }
    });
    return () => unsubscribe();
  },
  []);

  const handleAuthSuccess = async() => {
    if (fireAuth.currentUser) {
      const response = await fetch(
        `https://hackathon-ro2txyk6rq-uc.a.run.app/search?uid=${fireAuth.currentUser.uid}`);
      const data = await response.json();
      console.log(data);
      if (data && data.length > 0) {
        setProfileData(data[0]);
        setloading(false) // 配列の最初の要素にアクセス
      } else {
        setProfileData(null);
        setloading(false) // データがない場合はnullを設定
      }
    }
  };

  const handleProfileComplete = (profileData: any) => {
    setloading(true);
    setProfileComplete(profileData);
    setloading(false)
  };

  if (loading) {
    return <Center style={{ height: '100vh' }}>
              <Loader size="xl" />
          </Center>
  }

  if (!user) {
    return <Signup_in_App onAuthSuccess={handleAuthSuccess} />;
  }

  else if (!profileData && !profileComplete) {
    return <ProfileSetup onProfileComplete={handleProfileComplete} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Post_App />} />
        <Route path="/profile" element={<MyProfile_setting profileData={profileData}/>} />
        <Route path="/userProfile/:uid" element={<OtherProfile />} />
      </Routes>
    </Router>
  );
}


export default App;