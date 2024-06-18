import React,{ useState } from "react";
import { Container, TextInput, NumberInput, FileInput, Button, Paper, Title, Stack } from '@mantine/core';


type FormProps = {
  onSubmit: (name: string, age:number, username:string) => void;
  onImageChange: (file: File | null) => void;
};
//onsubmitに代入されたhandlesubmitからデータを受け取る
const Profileform: React.FC<FormProps> = ({ onSubmit, onImageChange }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [username, setUsername] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(name, age as number, username);
      setName("");
      setAge("");
      setUsername("");
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <Container size="xs" px="xs">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Title align="center" order={2}>プロフィール登録</Title>
        <form onSubmit={submit}>
          <Stack>
            <FileInput label="Profile Image" onChange={onImageChange} required />
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <NumberInput
              label="Age"
              value={age}
              onChange={(value) => setAge(value)}
              required
              min={5}
              max={80}
            />
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Button type="submit" fullWidth mt="md">
              Save Profile
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Profileform;