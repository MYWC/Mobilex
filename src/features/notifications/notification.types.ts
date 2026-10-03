export type NotificationTone = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  tone: NotificationTone;
  createdAt: number;
  read: boolean;
  href?: string;
}
