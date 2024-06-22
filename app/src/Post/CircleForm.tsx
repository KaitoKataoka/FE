import React, { useState } from 'react';
import { Box, Button, Input, Text, Center, Card } from '@mantine/core';
import { fireAuth } from '../firebase.ts';
import { IconPlus } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

interface Circle {
  circleid: string;
  circlename: string;
  creater: string;
}

interface CircleCreateFormProps {
  onCircleCreated: () => void;
}

const CircleCreateForm: React.FC<CircleCreateFormProps> = ({ onCircleCreated }) => {
  const [circleName, setCircleName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const isMobile2 = useMediaQuery(`(max-width: ${1050}px)`);
  const isMobile = useMediaQuery(`(max-width: ${767}px)`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleName) {
      setError('サークル名を入力してください');
      return;
    }

    try {
      const response = await fetch('https://hackathon-ro2txyk6rq-uc.a.run.app/postcircle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ circleName, creater: fireAuth.currentUser?.uid }),
      });

      if (response.ok) {
        setSuccess('サークルが作成されました');
        setCircleName('');
        setError('');
        onCircleCreated(); // サークルが作成された後に親コンポーネントに通知
      } else {
        const result = await response.json();
        setError(result.message || 'サークルの作成に失敗しました');
        setSuccess('');
      }
    } catch (err) {
      setError('サークルの作成に失敗しました');
      setSuccess('');
    }
  };

  return (
    <Center>
      <Box>
        {!showForm ? (
          <Button variant="outline" onClick={() => setShowForm(true)} leftIcon={<IconPlus />} sx={{ width: isMobile ?   '30%':(isMobile2 ?   '60%':'100%')}}>
            サークルを作成
          </Button>
        ) : (
          <Card shadow="sm" p="lg" radius="md" withBorder style={{ width: isMobile ? '100px':(isMobile2 ?  '140px':'300px')}}>
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="サークル名"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
                mb="md"
              />
              {error && <Text color="red">{error}</Text>}
              {success && <Text color="green">{success}</Text>}
              <Button type="submit" fullWidth>
                サークル作成
              </Button>
              <Button variant="outline" fullWidth mt="md" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </form>
          </Card>
        )}
      </Box>
    </Center>
  );
};

export default CircleCreateForm;
