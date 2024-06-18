import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { fireAuth } from "../firebase.ts";
import { getAuth } from "firebase/auth";
import React, { useState } from 'react';
import { Container, TextInput, PasswordInput, Button, Paper, Title, Divider, Stack } from '@mantine/core';

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

    <Container size="xs" px="xs">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title align="center" order={2}>ログイン</Title>
        <form onSubmit={signInWithemail}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth mt="md">
              ログイン
            </Button>
          </Stack>
        </form>
        <Divider label="または" labelPosition="center" my="lg" />
        <Button variant="default" fullWidth mt="md" onClick={signInWithGoogle}>
          Googleでログイン
        </Button>
      </Paper>
    </Container>
  );

};
export default Signinform;