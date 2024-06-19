import React, { useState } from 'react';
import { Textarea, Button, Box } from '@mantine/core';



interface NewPostProps {
  onNewPost: (content: string) => void;
}

const Contentform = (props: NewPostProps) =>{
  const [content, setContent] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
    await props.onNewPost(content);
    setContent('');
    }catch(error){
      console.log(error)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb="md">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's happening?"
          autosize
          minRows={2}
        />
      </Box>
      <Button type="submit">
        Post
      </Button>
    </form>
  );
};

export default Contentform;
