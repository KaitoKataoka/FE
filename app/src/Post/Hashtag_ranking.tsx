import React from 'react';
import { Box, Text, Card, Badge, Divider } from '@mantine/core';
import { IconHash } from '@tabler/icons-react';

interface HashtagRankingProps {
  hashtags: string[];
}

const HashtagRanking: React.FC<HashtagRankingProps> = ({ hashtags }) => {
  // ハッシュタグのカウントを行うロジックを追加
  const hashtagCounts: { [key: string]: number } = {};
  hashtags.forEach((hashtag) => {
    if (hashtagCounts[hashtag]) {
      hashtagCounts[hashtag]++;
      console.log(hashtag, hashtagCounts[hashtag])
    } else {
      hashtagCounts[hashtag] = 1;
    }
  });

  // ハッシュタグを頻度でソートしてランキングを作成
  const sortedHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]);

  const getColorByRank = (rank: number) => {
    switch (rank) {
      case 0:
        return 'red';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      default:
        return 'black';
    }
  };
  const getColorByRank2 = (rank: number) => {
    switch (rank) {
      case 0:
        return 'red';
      case 1:
        return 'blue';
      case 2:
        return 'green';
      default:
        return 'dark';
    }
  };

  const shortenHashtag = (hashtag: string) => {
    return hashtag.length > 9 ? `${hashtag.slice(1, 8)}...` : hashtag.slice(1);
  };

  return (
    <Card shadow="sm" p="lg" style={{ width: '100%' }}>
      <Text weight={700} size="lg" mb="md" align="center">
        トレンド
      </Text>
      {sortedHashtags.map(([hashtag, count], index) => (
        <Box key={index} mb="sm">
          <Divider my="sm" />
          <Box display="flex">
            <IconHash size={20} color={getColorByRank(index)} />
            <Text size="md" weight={500} ml="xs" color={getColorByRank(index)}>
              {shortenHashtag(hashtag)} {/* ハッシュタグから#を取り除く */}
            </Text>
            <Badge color={getColorByRank2(index)} ml="auto">
              {count}
            </Badge>
          </Box>
        </Box>
      ))}
    </Card>
  );
};

export default HashtagRanking;
