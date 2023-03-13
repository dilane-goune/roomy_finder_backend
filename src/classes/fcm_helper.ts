import { defaultMessaging } from "../functions/firebase";
import nullFilterHelper from "../functions/null_filter_helper";

export default class FCMHelper {
  static async send(fcmToken: string, data: { [key: string]: string }) {
    try {
      await defaultMessaging.send({ token: fcmToken, data: data });
      // console.log("Successfully sent message:", response);
    } catch (error) {
      console.log("Error sending message:", error);
    }
  }

  static async sendTopic(topic: string, data: { [key: string]: string }) {
    try {
      await defaultMessaging.send({ topic: topic, data: data });
      // console.log("Successfully sent message:", response);
    } catch (error) {
      console.log("Error sending topic message:", error);
    }
  }

  static async sendMulticast(
    fcmTokens: (string | undefined)[],
    data: { [key: string]: string }
  ) {
    const tokens = fcmTokens.filter(nullFilterHelper);
    try {
      const response = await defaultMessaging.sendMulticast({
        tokens,
        data: data,
      });
      console.log(response.successCount + " messages were sent successfully");
    } catch (error) {
      console.log("Error sending message:", error);
    }
  }
  static async sendNofication(
    event: NotificationEvent,
    fcmToken: string,

    data: { [key: string]: string }
  ) {
    try {
      await defaultMessaging.send({
        token: fcmToken,
        data: { ...data, event },
        notification: {
          body: data["message"],
        },
      });
      // console.log("Successfully sent message for event : " + event, response);
      return true;
    } catch (error) {
      console.log("Error sending message:", error);
      return false;
    }
  }
}

export type NotificationEvent =
  | "new-booking"
  | "booking-offered"
  | "booking-declined"
  | "booking-cancelled"
  | "deal-ended"
  | "deal-paid"
  | "new-message"
  | "auto-reply"
  | "pay-out-completed"
  | "pay-out-failed"
  | "pay-property-rent-fee-failed-client"
  | "pay-property-rent-fee-completed-client"
  | "pay-property-rent-fee-completed-landlord"
  | "plan-upgraded-successfully";
