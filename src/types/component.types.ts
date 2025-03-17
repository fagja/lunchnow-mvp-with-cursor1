import { User, RecruitingUser, Match, Message } from './database.types';

/**
 * ユーザーカードコンポーネント Props
 */
export interface UserCardProps {
  user: RecruitingUser;
  onLike: (userId: number) => void;
  isLoading?: boolean;
}

/**
 * プロフィールフォーム Props
 */
export interface ProfileFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: Partial<User>) => void;
  isLoading?: boolean;
}

/**
 * チャットメッセージ Props
 */
export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

/**
 * チャットフォーム Props
 */
export interface ChatFormProps {
  matchId: number;
  userId: number;
  onSend: (content: string) => void;
  isLoading?: boolean;
}

/**
 * モーダル Props
 */
export interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

/**
 * プレースホルダー/ローディング Props
 */
export interface LoadingProps {
  count?: number;
  type?: 'card' | 'text' | 'message';
}