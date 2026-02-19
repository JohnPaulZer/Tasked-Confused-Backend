import mailConfiguration from "src/config/mail.config";

// Send email via nodemailer with plain text and optional HTML content
export const sendEmail = async (emailOptions: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  const transporter = mailConfiguration;

  try {
    // Send the email using the nodemailer transporter configuration
    const feedback = await transporter.sendMail({
      from: process.env.MAIL, // sender address (configured in .env)
      to: emailOptions.to, // recipient's email
      subject: emailOptions.subject, // subject line
      text: emailOptions.text, // plain text version of the message
      html: emailOptions.html, // HTML version of the message (optional)
    });

    return feedback;
  } catch (error) {
    // Log and throw the error for better traceability
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
