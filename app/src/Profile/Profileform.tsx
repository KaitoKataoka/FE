import React, { useState, useRef } from "react";
import { Container, TextInput, NumberInput, FileInput, Button, Paper, Title, Stack, Image, Textarea } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Profileform.css';

type FormProps = {
  onSubmit: (name: string, age: number, username: string, birthday: string, comment: string) => void;
  onImageChange: (file: File | null) => void;
  imagePreview: string | null;
};

const Profileform: React.FC<FormProps> = ({ onSubmit, onImageChange, imagePreview }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [comment, setComment] = useState<string>("");
  const datePickerRef = useRef<DatePicker>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const birthdayString = birthday ? birthday.toISOString().substring(0, 10) : "";
      await onSubmit(name, age as number, username, birthdayString, comment);
      setName("");
      setAge("");
      setUsername("");
      setBirthday(null);
      setComment("");
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
            {imagePreview && <Image src={imagePreview} alt="Profile Preview" radius="md" />}
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
            <TextInput
              label="Birthday"
              placeholder="Select a date"
              value={birthday ? birthday.toISOString().substring(0, 10) : ''}
              readOnly
              onClick={() => datePickerRef.current?.setOpen(true)}
              rightSection={<IconCalendar size={16} onClick={() => datePickerRef.current?.setOpen(true)} style={{ cursor: 'pointer' }} />}
            />
            <div className="hidden-datepicker">
              <DatePicker
                selected={birthday}
                onChange={(date: Date | null) => setBirthday(date)}
                dateFormat="yyyy/MM/dd"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                placeholderText="Select a date"
                id="datepicker"
                className="custom-datepicker"
                ref={datePickerRef}
                withPortal
              />
            </div>
            <Textarea
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
