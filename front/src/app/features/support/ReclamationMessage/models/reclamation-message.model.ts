export type ReclamationMessageVisibility = 'PUBLIC' | 'INTERNAL' | 'CUSTOMER';

export interface ReclamationMessage {
  messageId?: number;
  authorUserId?: number;
  visibility?: ReclamationMessageVisibility;
  message: string;
  createdAt?: string;
}
