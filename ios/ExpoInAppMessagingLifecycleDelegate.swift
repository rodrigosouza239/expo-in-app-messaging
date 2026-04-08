import ExpoModulesCore
import FirebaseInAppMessaging

public class ExpoInAppMessagingLifecycleDelegate: ExpoAppDelegateSubscriber {
  public static var instance: ExpoInAppMessagingLifecycleDelegate?
  
  public var currentDisplayDelegate: InAppMessagingDisplayDelegate?
  public var onMessage: ((InAppMessagingDisplayMessage) -> Void)?

    public required init() {
    super.init()
    Self.instance = self
  }

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    InAppMessaging.inAppMessaging().messageDisplayComponent = self
    return true
  }
}

extension ExpoInAppMessagingLifecycleDelegate: InAppMessagingDisplay {
  public func displayMessage(_ messageForDisplay: InAppMessagingDisplayMessage, displayDelegate: InAppMessagingDisplayDelegate) {
    self.currentDisplayDelegate = displayDelegate
    
    DispatchQueue.main.async {
      self.onMessage?(messageForDisplay)
    }
  }
}
