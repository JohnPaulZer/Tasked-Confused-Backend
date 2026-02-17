import { sendEmail } from "./mail"; // Your existing generic mail sender

interface OtpEmailParams {
  email: string;
  name: string; // Optional: if you want to address them by name
  otp: string;
}

export const sendOtpEmail = async ({ email, name, otp }: OtpEmailParams) => {
  
  // 🎨 DESIGN YOUR HTML TEMPLATE HERE


  // 🚀 SEND THE EMAIL
  await sendEmail({
    to: email,
    subject: "Your Verification Code",
    text: `Your Verification Code is: ${otp}. It expires in 15 minutes.`, // Fallback for non-HTML clients
    html: `
<div style="font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
  
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
    
    <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 2px solid #f3f4f6;">
      <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">To Do List System</h1>
    </div>

    <div style="padding: 40px 30px; text-align: center;">
      
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 12px; border-radius: 50%; background-color: #f3f4f6; color: #111827; font-size: 24px;">
          🔒
        </span>
      </div>

      <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #111827;">Password Reset</h2>
      
      <p style="margin: 0 0 30px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
        Hello <strong>${name || "User"}</strong>,<br/>
        We received a request to reset your password. Please use the verification code below:
      </p>

      <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px;">
        <span style="display: block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111827; font-family: monospace;">
          ${otp}
        </span>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        This code will expire in <strong>15 minutes</strong>.<br>
        If you didn't request this, simply ignore this email.
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} To Do List System. All rights reserved.</p>
    </div>
    
  </div>
</div>
`,
  });
};