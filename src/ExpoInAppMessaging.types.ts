/**
 * The message type as defined by Firebase In-App Messaging.
 */
export type InAppMessageType = 'BANNER' | 'MODAL' | 'CARD' | 'IMAGE_ONLY' | 'UNKNOWN';
export type InAppMessagePayload = {
  /** Message display type. */
  type: InAppMessageType;
  /** Title text. Empty string for IMAGE_ONLY messages. */
  title: string;
  /** Body text. Empty string when not set. */
  body: string;
  /** Image URL. Empty string when not set. */
  imageUrl: string;
  /** CTA action URL. Empty string when not set. */
  actionUrl: string;
  /** Firebase campaign ID. */
  campaignId: string;
  /** Firebase campaign name. */
  campaignName: string;
  /**
   * Whether this is a test message sent from the Firebase console.
   * Android only — not available in the Firebase iOS SDK.
   */
  isTestMessage?: boolean;
  /** Custom key-value data attached to the campaign in the Firebase console. */
  data: Record<string, string>;
};

export type ExpoInAppMessagingModuleEvents = {
  onMessage: (params: InAppMessagePayload) => void;
};

export interface ExpoInAppMessagingModule {
  /**
   * Returns the message that triggered the app to open (cold-start scenario).
   * Returns `null` if the app was not opened by a Firebase In-App Message.
   * iOS only — on Android this always returns `null` (messages arrive via `onMessage`).
   */
  getPendingMessage(): Promise<InAppMessagePayload | null>;

  /**
   * Suppresses or resumes Firebase In-App Message delivery.
   * Useful for preventing messages from appearing during onboarding or checkout flows.
   */
  setMessagesSuppressed(suppressed: boolean): void;

  /**
   * Manually triggers a Firebase In-App Messaging event.
   * Use this to show messages tied to custom trigger events defined in the Firebase console.
   */
  triggerEvent(eventName: string): void;

  /**
   * Logs a CTA button click to Firebase Analytics.
   * Call this when the user taps the action button in your custom UI.
   * This is required for Firebase campaign click metrics to work correctly.
   */
  logClick(): Promise<void>;

  /**
   * Logs a message dismissal to Firebase Analytics.
   * Call this when the user closes your custom UI without clicking the CTA.
   * This is required for Firebase campaign dismiss metrics to work correctly.
   */
  logDismiss(): Promise<void>;
}
