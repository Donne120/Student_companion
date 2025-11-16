
export interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: number;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  createdAt?: Date;
  updatedAt?: Date;
}
