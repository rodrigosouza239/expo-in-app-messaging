package expo.modules.inappmessaging

import android.util.Log
import com.google.firebase.inappmessaging.FirebaseInAppMessaging
import com.google.firebase.inappmessaging.FirebaseInAppMessagingDisplayCallbacks
import com.google.firebase.inappmessaging.model.BannerMessage
import com.google.firebase.inappmessaging.model.CardMessage
import com.google.firebase.inappmessaging.model.ImageOnlyMessage
import com.google.firebase.inappmessaging.model.InAppMessage
import com.google.firebase.inappmessaging.model.Action
import com.google.firebase.inappmessaging.model.MessageType
import com.google.firebase.inappmessaging.model.ModalMessage
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoInAppMessagingModule : Module() {

  private var currentCallbacks: FirebaseInAppMessagingDisplayCallbacks? = null
  private var currentActionUrl: String = ""

  override fun definition() = ModuleDefinition {
    Name("ExpoInAppMessaging")

    Events("onMessage")

    OnCreate {
      FirebaseInAppMessaging.getInstance().setMessageDisplayComponent { message, callbacks ->
        currentCallbacks = callbacks
        currentActionUrl = extractActionUrl(message)

        val payload = buildPayload(message)
        sendEvent("onMessage", payload)
        callbacks.impressionDetected()
      }
    }

    Function("setMessagesSuppressed") { suppressed: Boolean ->
      FirebaseInAppMessaging.getInstance().setMessagesSuppressed(suppressed)
    }

    Function("triggerEvent") { eventName: String ->
      FirebaseInAppMessaging.getInstance().triggerEvent(eventName)
    }

    AsyncFunction("getPendingMessage") {
      return@AsyncFunction null
    }


    AsyncFunction("logClick") {
      try {
        val action = Action.builder().setActionUrl(currentActionUrl).build()
        currentCallbacks?.messageClicked(action)
        currentCallbacks = null
      } catch (e: Exception) {
        Log.e("ExpoInAppMessaging", "Failed to log click: ${e.message}")
      }
    }


    AsyncFunction("logDismiss") {
      try {
        currentCallbacks?.messageDismissed(
          FirebaseInAppMessagingDisplayCallbacks.InAppMessagingDismissType.UNKNOWN_DISMISS_TYPE
        )
        currentCallbacks = null
      } catch (e: Exception) {
        Log.e("ExpoInAppMessaging", "Failed to log dismiss: ${e.message}")
      }
    }
  }


  private fun extractActionUrl(message: InAppMessage): String {
    return when (message.messageType) {
      MessageType.CARD -> (message as? CardMessage)?.primaryAction?.actionUrl ?: ""
      MessageType.MODAL -> (message as? ModalMessage)?.action?.actionUrl ?: ""
      MessageType.BANNER -> (message as? BannerMessage)?.action?.actionUrl ?: ""
      MessageType.IMAGE_ONLY -> (message as? ImageOnlyMessage)?.action?.actionUrl ?: ""
      else -> ""
    }
  }

  private fun buildPayload(message: InAppMessage): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()

    map["type"] = message.messageType?.name ?: "UNKNOWN"
    map["campaignId"] = message.campaignMetadata?.campaignId ?: ""
    map["campaignName"] = message.campaignMetadata?.campaignName ?: ""
    map["isTestMessage"] = message.campaignMetadata?.isTestMessage ?: false
    map["data"] = message.data ?: emptyMap<String, String>()
    map["title"] = ""
    map["body"] = ""
    map["imageUrl"] = ""
    map["actionUrl"] = currentActionUrl

    when (message.messageType) {
      MessageType.CARD -> {
        val card = message as CardMessage
        map["title"] = card.title.text ?: ""
        map["body"] = card.body?.text ?: ""
        map["imageUrl"] = card.portraitImageData?.imageUrl ?: ""
      }
      MessageType.MODAL -> {
        val modal = message as ModalMessage
        map["title"] = modal.title.text ?: ""
        map["body"] = modal.body?.text ?: ""
        map["imageUrl"] = modal.imageData?.imageUrl ?: ""
      }
      MessageType.BANNER -> {
        val banner = message as BannerMessage
        map["title"] = banner.title.text ?: ""
        map["body"] = banner.body?.text ?: ""
        map["imageUrl"] = banner.imageData?.imageUrl ?: ""
      }
      MessageType.IMAGE_ONLY -> {
        val img = message as ImageOnlyMessage
        map["imageUrl"] = img.imageData?.imageUrl ?: ""
      }
      else -> {}
    }

    return map
  }
}
