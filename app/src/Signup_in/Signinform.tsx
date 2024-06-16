import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { fireAuth } from "../firebase.ts";
import { getAuth } from "firebase/auth";
import React, { useState } from 'react';

export const Signinform: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  /**
   * googleでログインする
   */
  const signInWithGoogle = (): void => {
    // Google認証プロバイダを利用する
    const provider = new GoogleAuthProvider();

    // ログイン用のポップアップを表示
    signInWithPopup(fireAuth, provider)
      .then(res => {
        const user = res.user;
        alert("ログインユーザー: " + user.displayName);
      })
      .catch(err => {
        const errorMessage = err.message;
        alert(errorMessage);
      });
  };


  const signInWithemail = async (e: React.FormEvent<HTMLFormElement>) =>{
      e.preventDefault()
      try{
        const fireAuth = getAuth();
        await signInWithEmailAndPassword(fireAuth, email, password)
        setEmail("");
        setPassword("");
      }catch(error){
        console.log(error);
        alert("failed to login")
      };
    };

  return (

    <div>
      <label>
        emailでログイン
      </label>
      <form onSubmit={signInWithemail}>
      <div>
        <div>
        <label>email: </label>
        <input
          type={"text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        </div>
      </div>

      <div>
        <div>
        <label>password: </label>
        <input
          type={"text"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        </div>
      </div>
      <div>
        <button type={"submit"}>
        ログイン
        </button>
      </div>
      <label>
        googleでログイン
      </label>
      </form>
      <div>
      <button onClick={signInWithGoogle}>
        Googleでログイン
      </button>
      </div>
    </div>
  );

};
export default Signinform;