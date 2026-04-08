export type InAppMessagePayload = {
  title: string;
  body: string;
  imageUrl: string;
  actionUrl: string;
  type: string;
  campaignId?: string;
};

export type ExpoInAppMessagingModuleEvents = {
  onMessage: (params: InAppMessagePayload) => void;
};
export interface ExpoInAppMessagingModule {
  getPendingMessage(): Promise<InAppMessagePayload | null>;
  setMessagesSuppressed(suppressed: boolean): void;
  triggerEvent(eventName: string): void;
  logClick(): Promise<void>;
}