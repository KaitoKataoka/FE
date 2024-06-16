import React, { useState, useEffect } from 'react';
import { signOut,onAuthStateChanged } from 'firebase/auth';
import { fireAuth} from '../firebase.ts';
import Profileform from './Profileform.tsx';
import Contents from './Contents.tsx';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupProps {
  onProfileComplete: (profileData: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      setLoginUser(user);
    });
    return () => unsubscribe();
  }, []);

  //profile登録

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (name: string, age: string, username: string) => {
    return new Promise<void>(async (resolve, reject) => {
    var errormessage = ""
    setLoading(true);
    const age2 = Number(age)
    const firebaseUID = fireAuth.currentUser?.uid

    if (!name || !age || !username){
      alert("name or age or username is empty");
      errormessage = "name or age or username is empty"
    }

    else if (name.length > 50) {
      alert("Please enter a name shorter than 50 characters");
      errormessage = "Please enter a name shorter than 50 characters"
    }

    else if (age2 < 5 || age2 > 80) {
      alert("Please enter age between 20 and 80");
      errormessage = "Please enter age between 20 and 80"
    }

    else if (username.length > 20){
      alert("Please enter a username shorter than 20 characters")
      errormessage = "Please enter a username shorter than 20 characters"
    }

    if (errormessage) {
      console.log(errormessage);
      setLoading(false);
      reject(errormessage);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('uid', firebaseUID || '');
      formData.append('name', name);
      formData.append('age', age2.toString());
      formData.append('username', username);
      if (profileImage) {
        formData.append('avatar', profileImage);
      }

      const response = await fetch("https://hackathon-ro2txyk6rq-uc.a.run.app/register", {
        method: "POST",
        body: formData,
      });
    if (!response.ok) {
      alert("failed to POST")
      errormessage = "failed to POST"
      setLoading(false);
      reject(errormessage)
      return;
    }else{
      const profileData = await response.json();
      console.log(firebaseUID);
      setLoading(false);
      resolve();
      onProfileComplete(profileData);
    }

    }catch(error){
      console.error("failed POSTing",error)
      alert("failed POSTing")
      setLoading(false);
      reject(error)
    }
  });
};

useEffect(() => {
  if (loading) {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [loading]);

//ログアウト
  const signOutWithGoogle = (): void => {
    signOut(fireAuth).then(() => {
      alert("ログアウトしました");
    }).catch(err => {
      alert(err);
    });
  };



  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Profileform onSubmit={handleSubmit} onImageChange={handleImageChange} />
          <button onClick={signOutWithGoogle}>
            ログアウト
          </button>
          <div className='login'>
            {/* ログインしていないと見られないコンテンツは、loginUserがnullの場合表示しない */}
            {loginUser ? <Contents /> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSetup;
