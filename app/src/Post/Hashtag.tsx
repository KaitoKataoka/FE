import React from 'react';
import { Text } from '@mantine/core';

interface HashtagTextProps {
  text: string;
}

const HashtagText: React.FC<HashtagTextProps> = ({ text }) => {
  const renderTextWithHashtags = (text: string) => {
    const parts = text.split(/(#[^\s]+)/g); // ハッシュタグで分割
    return parts.map((part, index) =>
      part.startsWith('#') ? (
        <Text component="span" color="blue" key={index} weight={600}>{part}</Text>
      ) : (
        <Text  size="xl" component="span" key={index} weight={550}>{part}</Text>
      )
    );
  };

  return <>{renderTextWithHashtags(text)}</>;
};

export default HashtagText;
