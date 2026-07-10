
export interface MessageSource {
  title: string;
  source?: string;
  url?: string;
}

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
  /** Citations for AI answers: knowledge-base links or Gmail deep links. */
  sources?: MessageSource[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  createdAt?: Date;
  updatedAt?: Date;
}
