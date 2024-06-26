import React, { useState, useEffect } from 'react';
import { signOut,onAuthStateChanged } from 'firebase/auth';
import { fireAuth} from '../firebase.ts';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Profileform from './Profileform.tsx';
import Contents from './Contents.tsx';
import { Container, Button, Loader, Notification, Center } from '@mantine/core';

interface ProfileSetupProps {
  onProfileComplete: (profileData: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onProfileComplete }) => {

  const [loginUser, setLoginUser] = useState(fireAuth.currentUser);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      setLoginUser(user);
    });
    return () => unsubscribe();
  }, []);

  //profile登録

  const handleImageChange = (file: File | null) => {
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setImagePreview(null);
    }
  };
  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `profile_images/${fireAuth.currentUser?.uid}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (name: string, age: number, username: string, birthday: string, comment:string) => {
    return new Promise<void>(async (resolve, reject) => {
    var errormessage = ""
    setLoading(true);
    const firebaseUID = fireAuth.currentUser?.uid

    if (!name || !age || !username){
      alert("name or age or username is empty");
      errormessage = "name or age or username is empty"
    }

    else if (name.length > 50) {
      alert("Please enter a name shorter than 50 characters");
      errormessage = "Please enter a name shorter than 50 characters"
    }

    else if (age < 5 || age > 80) {
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
      setError(errormessage);
      reject(errormessage);
      return;
    }

    try {
      let avatarUrl = "";
      if (profileImage) {
        avatarUrl = await uploadImageAndGetUrl(profileImage);
      }

      const formData = new FormData();
      formData.append('uid', firebaseUID || '');
      formData.append('name', name);
      formData.append('age', age.toString());
      formData.append('username', username);
      formData.append('avatar_url', avatarUrl);
      formData.append('birthday', birthday);
      formData.append('comment', comment)
      console.log(avatarUrl)


      const response = await fetch("https://hackathon-ro2txyk6rq-uc.a.run.app/register", {
        method: "POST",
        body: formData,
      });
    if (!response.ok) {
      alert("failed to POST")
      errormessage = "failed to POST"
      setError(errormessage);
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
    }catch(err){
      console.error("failed POSTing",error)
      alert("failed POSTing")
      setLoading(false);
      setError(err.toString());
      reject(error)
    }
  });
};

useEffect(() => {
  if (loading) {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5000);

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
    <Container>
      {loading ? (
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" />
        </Center>
      ) : (
        <>
          <Profileform onSubmit={handleSubmit} onImageChange={handleImageChange} imagePreview={imagePreview}/>
          <Button onClick={signOutWithGoogle} color="red" mt="md">
            ログアウト
          </Button>
        </>
      )}
    </Container>
  );
};

export default ProfileSetup;
