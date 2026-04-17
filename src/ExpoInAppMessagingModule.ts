import { NativeModule, requireNativeModule } from 'expo';
import {
  ExpoInAppMessagingModuleEvents,
  InAppMessagePayload,
} from './ExpoInAppMessaging.types';

declare class ExpoInAppMessagingModule extends NativeModule<ExpoInAppMessagingModuleEvents> {
  getPendingMessage(): Promise<InAppMessagePayload | null>;
  setMessagesSuppressed(suppressed: boolean): void;
  triggerEvent(eventName: string): void;
  logClick(): Promise<void>;
  logDismiss(): Promise<void>;
}

export default requireNativeModule<ExpoInAppMessagingModule>('ExpoInAppMessaging');
