export interface Thread {
    id: string;
    user1_id: string;
    user2_id: string;
    last_message_id: string | null;
    last_message_at: string;
    created_at: string;
    other_user_name: string;
    other_user_avatar: string | null;
    last_message: string | null;
    last_message_sender_id: string | null;
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