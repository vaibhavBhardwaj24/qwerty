import nodemailer from "nodemailer";

// Email configuration - supports Gmail, SMTP, or Ethereal (dev mode)
const createTransporter = () => {
  // For production: Use Gmail or custom SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail", // 'gmail', 'outlook', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // For Gmail, use App Password
      },
    });
  }

  // For custom SMTP server
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Development mode: Log to console
  console.warn(
    "⚠️  Email credentials not configured. Emails will be logged to console in development mode."
  );
  console.warn(
    "💡 To send real emails, set EMAIL_USER and EMAIL_PASSWORD in your .env file"
  );

  // Return a test transporter that logs emails
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
};

export const transporter = createTransporter();

// Helper function to send workspace invitation email
export async function sendWorkspaceInvite({
  to,
  workspaceName,
  inviterName,
  inviteLink,
  role,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteLink: string;
  role: string;
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Qwerty App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You're invited to ${workspaceName}`,
    html: `
      <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">
        You were invited to ${workspaceName} by ${inviterName}
      </span>

      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to ${workspaceName}</h2>
        <p>${inviterName} invited you to join <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>

        <a href="${inviteLink}"
          style="display:inline-block;padding:12px 24px;background:#0070f3;color:white;
                 border-radius:6px;text-decoration:none;margin:20px 0;">
          Accept Invitation
        </a>

        <p style="color:#666;font-size:13px;">
          This link expires in 7 days. If you weren't expecting this, ignore this email.
        </p>
      </div>
    `,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // In development mode, log the email
    if (!process.env.EMAIL_USER) {
      console.log("\n📧 Email Preview (Development Mode):");
      console.log("To:", to);
      console.log("Subject:", mailOptions.subject);
      console.log("Message ID:", info.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info) || "N/A");
      console.log("\n");
    }

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
