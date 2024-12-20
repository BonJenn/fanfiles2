export interface User {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Post {
    id: string;
    created_at: string;
    creator_id: string;
    title?: string;
    description?: string;
    url: string;
    type: 'image' | 'video';
    is_public: boolean;
    price?: number;
    likes: number;
    comments: number;
    creator: {
      id: string;
      name: string;
      avatar_url: string;
    };
  }