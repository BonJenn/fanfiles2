export interface Thread {
    id: string;
    user1_id: string;
    user2_id: string;
    last_message_at: string;
    other_user: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    last_message: {
      content: string;
      created_at: string;
      is_mass_message: boolean;
      sender_id: string;
    };
    unread_count: number;
  }
  
  export interface Message {
    id: string;
    thread_id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    created_at: string;
    is_mass_message: boolean;
    attached_content_id: string | null;
    content_price: number;
    read_at: string | null;
    sender: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    attached_content?: {
      id: string;
      title: string;
      url: string;
      type: 'image' | 'video';
    };
  }