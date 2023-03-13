import { SEND_GRID_API_KEY } from "../data/constants";
import sendGrid from "@sendgrid/mail";

sendGrid.setApiKey(SEND_GRID_API_KEY);

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
    const response = await sendGrid.send({
      to: recieverEmail,
      from: "it@gsccapitalgroup.com",
      subject: subject,
      text: message,
    });

    console.log("Message sent: %s", response);
  } catch (error) {
    console.log(error);
    console.log("Failed to send email");
  }
}
