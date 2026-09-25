/** A button on a notification, such as "Anulează" after removing a product. */
export interface NotificationAction {
  readonly label: string;
  readonly run: () => void;
}

export interface Notification {
  readonly id: number;
  readonly message: string;
  readonly action?: NotificationAction;
}
