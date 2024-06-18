import React, { useState } from 'react';
import { MantineProvider, TextInput, PasswordInput, Button, Box, Title, Container } from '@mantine/core';

type FormProps = {
  onSignup: (email:string, password:string) => Promise<void>;
};


const Signupform: React.FC<FormProps> = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //枠を用意


  const Signup = async(e: React.FormEvent<HTMLFormElement>) =>{
      e.preventDefault();
      try{
        await onSignup(email, password);
        console.log("Success")
        setEmail("");
        setPassword("");
      }catch(error){
        console.log(error)
      }
  };
  return(
    <Container size="xs" px="xs" style={{ marginTop: '20px' }}>
      <Box style={{ textAlign: 'center', marginBottom: 'lg' }}>
        <Title order={3}>Sign Up</Title>
      </Box>
      <form onSubmit={Signup}>
        <Box mb="md">
          <TextInput
            label="Email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>
        <Box mb="md">
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>
        <Button type="submit" fullWidth>
          アカウントを作成
        </Button>
      </form>
    </Container>
  );
};


export default Signupform