import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { data, error } = await resend.emails.send({
    from: "YourApp <invites@resend.dev>",
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
          This link expires in 7 days. If you weren’t expecting this, ignore this email.
        </p>
      </div>
    `,
    replyTo: "support@resend.dev",
  });

  if (error) throw error;
  return data;
}
