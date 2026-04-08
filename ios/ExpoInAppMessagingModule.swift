import ExpoModulesCore
import FirebaseInAppMessaging

public class ExpoInAppMessagingModule: Module {
  private var lastDisplayDelegate: InAppMessagingDisplayDelegate?
    
  private static var pendingMessage: [String: Any]?
    
  public func definition() -> ModuleDefinition {
    Name("ExpoInAppMessaging")

    Events("onMessage")

    AsyncFunction("getPendingMessage") { () -> [String: Any]? in
            let message = Self.pendingMessage
            Self.pendingMessage = nil
            return message
    }
      
    Function("setMessagesSuppressed") { (suppressed: Bool) in
          print("🔥 Swift: Ajustando supressão para \(suppressed)")
          InAppMessaging.inAppMessaging().messageDisplaySuppressed = suppressed
    }
      
      Function("triggerEvent") { (eventName: String) in
          print("🔥 Swift: Disparando evento de gatilho: \(eventName)")
          InAppMessaging.inAppMessaging().triggerEvent(eventName)
    }


    Function("logEvent") { (eventName: String) in
          InAppMessaging.inAppMessaging().triggerEvent(eventName)
    }

      OnCreate {
            if let delegate = ExpoInAppMessagingLifecycleDelegate.instance {
              delegate.onMessage = { [weak self] message in
                guard let self = self else { return }
                
                self.lastDisplayDelegate = delegate.currentDisplayDelegate
                let payload = self.parseMessage(message)
                  
                Self.pendingMessage = payload
                
                print("🔥 Swift: Enviando evento onMessage e salvando em pendingMessage")
                self.sendEvent("onMessage", payload)
              }
            }
    }

    AsyncFunction("logClick") {
            print("Ads: Usuário clicou no botão no JS")
        }
     }
    
    private func getTitle(_ message: InAppMessagingDisplayMessage) -> String {
        if let msg = message as? InAppMessagingBannerDisplay { return msg.title }
        if let msg = message as? InAppMessagingModalDisplay { return msg.title }
        return ""
      }

      private func getBody(_ message: InAppMessagingDisplayMessage) -> String {
        if let msg = message as? InAppMessagingBannerDisplay { return msg.bodyText ?? "" }
        if let msg = message as? InAppMessagingModalDisplay { return msg.bodyText ?? "" }
        return ""
      }

      private func getImageURL(_ message: InAppMessagingDisplayMessage) -> String {
        if let msg = message as? InAppMessagingBannerDisplay { return msg.imageData?.imageURL ?? "" }
        if let msg = message as? InAppMessagingModalDisplay { return msg.imageData?.imageURL ?? "" }
        if let msg = message as? InAppMessagingImageOnlyDisplay { return msg.imageData.imageURL }
        return ""
      }

      private func getActionURL(_ message: InAppMessagingDisplayMessage) -> String {
        if let msg = message as? InAppMessagingBannerDisplay { return msg.actionURL?.absoluteString ?? "" }
        if let msg = message as? InAppMessagingModalDisplay { return msg.actionURL?.absoluteString ?? "" }
        if let msg = message as? InAppMessagingImageOnlyDisplay { return msg.actionURL?.absoluteString ?? "" }
        return ""
      }
      
      private func parseMessage(_ message: InAppMessagingDisplayMessage) -> [String: Any] {
        return [
          "title": getTitle(message),
          "body": getBody(message),
          "imageUrl": getImageURL(message),
          "actionUrl": getActionURL(message),
          "type": String(describing: type(of: message))
        ]
     }
}
