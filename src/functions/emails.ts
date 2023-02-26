import { MailtrapClient } from "mailtrap";
import { MAIL_ENDPOINT, MAIL_TOKEN } from "../data/constants";

export default async function sendEmail({
  subject,
  recieverEmail,
  message,
}: {
  subject: string;
  recieverEmail: string;
  message: string;
}) {
  try {
    const client = new MailtrapClient({
      endpoint: MAIL_ENDPOINT,
      token: MAIL_TOKEN,
    });

    const sender = {
      email: "mailtrap@gouneanlab.com",
      name: "Gounean Lab",
    };
    const recipients = [{ email: recieverEmail }];

    const response = await client.send({
      from: sender,
      to: recipients,
      subject: subject,
      text: message,
      category: "Integration Test",
    });

    console.log("Message sent: %s", response.success);
  } catch (error) {
    console.log(error);
    console.log("Failed to send email");
  }
}
