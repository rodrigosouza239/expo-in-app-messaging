package expo.modules.inappmessaging

import android.os.Bundle
import android.util.Log
import com.google.firebase.inappmessaging.FirebaseInAppMessaging
import com.google.firebase.inappmessaging.model.InAppMessage
import com.google.firebase.inappmessaging.model.MessageType
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

object InAppMessagingStorage {
    var bundleMessage: Bundle? = null
}

class ExpoInAppMessagingModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoInAppMessaging")

    Events("onMessage")

      OnCreate {
          val fiam = FirebaseInAppMessaging.getInstance()

          fiam.setMessageDisplayComponent { message, callbacks ->
              Log.d("FIAM_DEBUG", "Mensagem recebida no display component!")

              val payload = bundleMessage(message)
              sendEvent("onMessage", payload)
              callbacks.impressionDetected()
          }
      }

    Function("triggerEvent") { eventName: String ->
      Log.d("FIAM_DEBUG", "JS solicitou triggerEvent: ${eventName}")
      FirebaseInAppMessaging.getInstance().triggerEvent(eventName)
    }

    AsyncFunction("logClick") {
        Log.d("Ads", " Usuário clicou no botão no JS")
    }

    Function("setMessagesSuppressed") { suppressed: Boolean ->
      Log.d("FIAM_DEBUG", "JS solicitou setMessagesSuppressed: ${suppressed}")
      FirebaseInAppMessaging.getInstance().setMessagesSuppressed(suppressed)
    }

    AsyncFunction("getPendingMessage") {
        Log.d("FIAM_DEBUG", "JS solicitou getPendingMessage. Tem mensagem? ${InAppMessagingStorage.bundleMessage != null}")
        val message = InAppMessagingStorage.bundleMessage
        InAppMessagingStorage.bundleMessage = null
        return@AsyncFunction message
    }
  }
    private fun bundleMessage(message: InAppMessage): Map<String, Any?> {
        val map = mutableMapOf<String, Any?>()

        map["type"] = message.messageType?.name
        map["campaignId"] = message.campaignMetadata?.campaignId
        map["data"] = message.data ?: emptyMap<String, String>()

        when (message.messageType) {
            MessageType.CARD -> {
                val card = message as com.google.firebase.inappmessaging.model.CardMessage
                map["title"] = card.title.text
                map["body"] = card.body?.text
                map["imageUrl"] = card.portraitImageData?.imageUrl
            }
            MessageType.MODAL -> {
                val modal = message as com.google.firebase.inappmessaging.model.ModalMessage
                map["title"] = modal.title.text
                map["body"] = modal.body?.text
                map["imageUrl"] = modal.imageData?.imageUrl
            }
            MessageType.BANNER -> {
                val banner = message as com.google.firebase.inappmessaging.model.BannerMessage
                map["title"] = banner.title.text
                map["body"] = banner.body?.text
                map["imageUrl"] = banner.imageData?.imageUrl
            }
            MessageType.IMAGE_ONLY -> {
                val img = message as com.google.firebase.inappmessaging.model.ImageOnlyMessage
                map["imageUrl"] = img.imageData.imageUrl
            }
            else -> {
                map["title"] = "Nova Mensagem"
            }
        }
        return map
    }
}
