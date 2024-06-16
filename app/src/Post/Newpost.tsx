import React, { useState } from 'react';

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
      <input
      type ={"text"}
      value={content}
      onChange={e => setContent(e.target.value)}
      placeholder="What's happening?" />
      <button type="submit">
        Post
      </button>
    </form>
  );
};

export default Contentform;
