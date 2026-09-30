import { render } from "@react-email/components";

import { getResend, EMAIL_FROM } from "./client";
import { InvitationEmail } from "./templates/invitation";
import { WelcomeEmail } from "./templates/welcome";

type SendResult = { success: boolean; error?: string; id?: string };

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { success: false, error: "email_disabled" };

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function sendInvitationEmail({
  to,
  workspaceName,
  inviterName,
  role,
  inviteUrl,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}): Promise<SendResult> {
  const html = await render(
    InvitationEmail({ workspaceName, inviterName, role, inviteUrl })
  );

  return sendEmail({
    to,
    subject: `دعوة للانضمام إلى ${workspaceName} على Marketing Hub`,
    html,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
  dashboardUrl,
}: {
  to: string;
  name: string;
  dashboardUrl: string;
}): Promise<SendResult> {
  const html = await render(WelcomeEmail({ name, dashboardUrl }));
  return sendEmail({ to, subject: "مرحبًا بيك في Marketing Hub 🎉", html });
}