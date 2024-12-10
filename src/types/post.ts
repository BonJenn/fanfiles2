export interface User {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Post {
    id: string;
    title: string;
    url: string;
    type: 'image' | 'video';
    description: string;
    price: number;
    is_public: boolean;
    created_at: string;
    creator_id: string;
    creator: {
      id: string;
      name: string;
      avatar_url: string;
    };
  }