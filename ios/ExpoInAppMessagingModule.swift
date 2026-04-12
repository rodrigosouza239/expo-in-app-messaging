import ExpoModulesCore
import FirebaseInAppMessaging

public class ExpoInAppMessagingModule: Module {
  private static var pendingMessage: [String: Any]?

  public func definition() -> ModuleDefinition {
    Name("ExpoInAppMessaging")

    Events("onMessage")


    OnCreate {
      if let delegate = ExpoInAppMessagingLifecycleDelegate.instance {
        delegate.onMessage = { [weak self] message in
          guard let self = self else { return }

          let payload = self.parseMessage(message)
          Self.pendingMessage = payload

          delegate.currentDisplayDelegate?.impressionDetected?(for: message)

          self.sendEvent("onMessage", payload)
        }
      }
    }

 
    AsyncFunction("getPendingMessage") { () -> [String: Any]? in
      let message = Self.pendingMessage
      Self.pendingMessage = nil
      return message
    }

    Function("setMessagesSuppressed") { (suppressed: Bool) in
      InAppMessaging.inAppMessaging().messageDisplaySuppressed = suppressed
    }

    Function("triggerEvent") { (eventName: String) in
      InAppMessaging.inAppMessaging().triggerEvent(eventName)
    }

    AsyncFunction("logClick") { () -> Void in
      guard
        let delegate = ExpoInAppMessagingLifecycleDelegate.instance,
        let displayDelegate = delegate.currentDisplayDelegate,
        let message = delegate.currentMessage
      else { return }

      let actionURL = self.getActionURL(message)
      let action = InAppMessagingAction(
        actionText: nil,
        actionURL: actionURL.isEmpty ? nil : URL(string: actionURL)
      )
      displayDelegate.messageClicked?(message, with: action)
      delegate.currentMessage = nil
      delegate.currentDisplayDelegate = nil
    }


    AsyncFunction("logDismiss") { () -> Void in
      guard
        let delegate = ExpoInAppMessagingLifecycleDelegate.instance,
        let displayDelegate = delegate.currentDisplayDelegate,
        let message = delegate.currentMessage
      else { return }

      displayDelegate.messageDismissed?(message, dismissType: .typeUserTapClose)
      delegate.currentMessage = nil
      delegate.currentDisplayDelegate = nil
    }
  }

    
  private func parseMessage(_ message: InAppMessagingDisplayMessage) -> [String: Any] {
    var payload: [String: Any] = [
      "type": messageTypeName(message),
      "campaignId": message.campaignInfo.messageID,
      "campaignName": message.campaignInfo.campaignName ?? "",
      "data": message.appData ?? [:],
      "title": "",
      "body": "",
      "imageUrl": "",
      "actionUrl": ""
    ]

    if let msg = message as? InAppMessagingBannerDisplay {
      payload["title"] = msg.title
      payload["body"] = msg.bodyText ?? ""
      payload["imageUrl"] = msg.imageData?.imageURL ?? ""
      payload["actionUrl"] = msg.actionURL?.absoluteString ?? ""
    } else if let msg = message as? InAppMessagingModalDisplay {
      payload["title"] = msg.title
      payload["body"] = msg.bodyText ?? ""
      payload["imageUrl"] = msg.imageData?.imageURL ?? ""
      payload["actionUrl"] = msg.actionURL?.absoluteString ?? ""
    } else if let msg = message as? InAppMessagingCardDisplay {
      payload["title"] = msg.title
      payload["body"] = msg.body ?? ""
      payload["imageUrl"] = msg.portraitImageData.imageURL
      payload["actionUrl"] = msg.primaryActionURL?.absoluteString ?? ""
    } else if let msg = message as? InAppMessagingImageOnlyDisplay {
      payload["imageUrl"] = msg.imageData.imageURL
      payload["actionUrl"] = msg.actionURL?.absoluteString ?? ""
    }

    return payload
  }

  private func messageTypeName(_ message: InAppMessagingDisplayMessage) -> String {
    if message is InAppMessagingBannerDisplay { return "BANNER" }
    if message is InAppMessagingModalDisplay { return "MODAL" }
    if message is InAppMessagingCardDisplay { return "CARD" }
    if message is InAppMessagingImageOnlyDisplay { return "IMAGE_ONLY" }
    return "UNKNOWN"
  }

  private func getActionURL(_ message: InAppMessagingDisplayMessage) -> String {
    if let msg = message as? InAppMessagingBannerDisplay {
      return msg.actionURL?.absoluteString ?? ""
    }
    if let msg = message as? InAppMessagingModalDisplay {
      return msg.actionURL?.absoluteString ?? ""
    }
    if let msg = message as? InAppMessagingCardDisplay {
      return msg.primaryActionURL?.absoluteString ?? ""
    }
    if let msg = message as? InAppMessagingImageOnlyDisplay {
      return msg.actionURL?.absoluteString ?? ""
    }
    return ""
  }
}

