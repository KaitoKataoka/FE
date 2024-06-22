import React, { useEffect, useState } from 'react';
import { Box, Text, Center, List, Title, Loader, Avatar, Card, ScrollArea, Container, Grid, Divider } from '@mantine/core';
import { fireAuth } from '../firebase.ts';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';

interface Circle {
  circleid: string;
  circlename: string;
  creater: string;
}

interface CircleListProps {
  refreshTrigger: boolean; // リストを更新するためのトリガー
}

const CircleList: React.FC<CircleListProps> = ({ refreshTrigger }) => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile2 = useMediaQuery(`(max-width: ${1050}px)`);
  const isMobile = useMediaQuery(`(max-width: ${767}px)`);

  const fetchCircles = async () => {
    try {
      const response = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/getcircle?uid=${fireAuth.currentUser?.uid}`);
      const myresponse = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchcircleid?uid=${fireAuth.currentUser?.uid}`);

      if (response.ok && myresponse.ok) {
        const data = await response.json();
        console.log('Fetched circles:', data);
        const fetchedCircles = data || []; // サークルが存在しない場合は空の配列を設定

        const mydata = await myresponse.json();
        console.log(mydata);
        const circlesData = await Promise.all(mydata.map(async (item: { circleid: string }) => {
          const myresponse2 = await fetch(`https://hackathon-ro2txyk6rq-uc.a.run.app/searchcirclename?circleid=${item.circleid}`);
          const mydata2 = await myresponse2.json();
          console.log(mydata2);
          return mydata2.map((circleItem: any) => ({
            circleid: item.circleid,
            circlename: circleItem.circlename,
            creater: circleItem.creater,
          }));
        }));
        const flattenedCirclesData = circlesData.flat();

        // circleid を基準に一意のサークルだけを残す
        const uniqueCircles = [...fetchedCircles, ...flattenedCirclesData].reduce((acc: Circle[], current) => {
          if (!acc.some(circle => circle.circleid === current.circleid)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setCircles(uniqueCircles);
        console.log(uniqueCircles);
      } else {
        setError('サークルの取得に失敗しました');
      }
    } catch (err) {
      setError('サークルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [refreshTrigger]); // トリガーが変わるたびに再度取得

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
            <Loader size="xl" />
          </Center>
    );
  }

  return (
    <Container>
      <Text  align="center" mb="md" weight={700} size={isMobile ?  "xs":"lg"}>サークル</Text>
        <List spacing="lg" size="sm" mb="lg" center>
          {circles.map((circle) => (
            <Grid key={circle.circleid}>
              <Link to={`/circle/${circle.circleid}`} style={{ textDecoration: 'none' }}>
                  <Center>
                    <Avatar size={isMobile ? 20:(isMobile2 ?  30:40)} radius="xl" mr="md" src={`https://api.adorable.io/avatars/40/${circle.circleid}.png`} />
                    <Text size={isMobile2 ?  "xs":"lg"} weight={700} color='black' align="center">
                      {circle.circlename}
                    </Text>
                  </Center>
                  <Divider my="sm" sx={{ width:isMobile ?  '100%':(isMobile2 ?  '140%':'300%' )}}/>
              </Link>
            </Grid>
          ))}
        </List>
      </Container>
  );
};

export default CircleList;
