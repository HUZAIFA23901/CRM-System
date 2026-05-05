import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function mailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

type EmailTemplateInput = {
  preheader: string;
  title: string;
  subtitle: string;
  summary: Array<{ label: string; value: string }>;
  primaryCta?: { label: string; href: string };
  body: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapHtml(input: EmailTemplateInput) {
  const summaryRows = input.summary
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#64748b;font-size:14px;">${escapeHtml(item.label)}</td>
          <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(item.value)}</td>
        </tr>`
    )
    .join("");

  const cta = input.primaryCta
    ? `<a href="${escapeHtml(input.primaryCta.href)}" style="display:inline-block;margin-top:20px;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;font-size:14px;">${escapeHtml(input.primaryCta.label)}</a>`
    : "";

  return `
    <div style="margin:0;padding:32px 0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#ffffff;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#cbd5e1;margin-bottom:8px;">${escapeHtml(input.preheader)}</div>
          <h1 style="margin:0;font-size:26px;line-height:1.2;">${escapeHtml(input.title)}</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#e2e8f0;">${escapeHtml(input.subtitle)}</p>
        </div>
        <div style="padding:28px 32px;color:#0f172a;">
          <div style="font-size:15px;line-height:1.7;color:#334155;">${input.body}</div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:20px;border-collapse:collapse;">${summaryRows}</table>
          ${cta}
        </div>
        <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
          Property Dealer CRM notifications. This message was generated automatically.
        </div>
      </div>
    </div>`;
}

async function sendMailSafely(message: Parameters<typeof transporter.sendMail>[0]) {
  if (!mailEnabled()) return;

  try {
    await transporter.sendMail(message);
  } catch (error) {
    console.warn("Email notification skipped:", error);
  }
}

export async function sendLeadCreatedEmail(to: string, leadName: string) {
  await sendMailSafely({
    from: process.env.MAIL_FROM,
    to,
    subject: `New Lead Alert: ${leadName}`,
    html: wrapHtml({
      preheader: "New lead captured in the CRM",
      title: "New Lead Created",
      subtitle: "A new lead has been added and is ready for review or assignment.",
      summary: [
        { label: "Lead Name", value: leadName },
        { label: "Notification", value: "New lead alert" }
      ],
      body: `<p style="margin:0;">A new lead named <strong>${escapeHtml(leadName)}</strong> has been created in the CRM.</p>`,
      primaryCta: { label: "Open CRM", href: process.env.NEXTAUTH_URL ?? "http://localhost:3000" }
    })
  });
}

export async function sendLeadAssignedEmail(to: string, leadName: string) {
  await sendMailSafely({
    from: process.env.MAIL_FROM,
    to,
    subject: `Lead Assignment Confirmed: ${leadName}`,
    html: wrapHtml({
      preheader: "You have a new lead assignment",
      title: "Lead Assignment Confirmation",
      subtitle: "You have been assigned a lead and can begin follow-up immediately.",
      summary: [
        { label: "Lead Name", value: leadName },
        { label: "Status", value: "Assigned" }
      ],
      body: `<p style="margin:0;">You have been assigned <strong>${escapeHtml(leadName)}</strong>. Please review the lead details and update the follow-up status as needed.</p>`,
      primaryCta: { label: "View Dashboard", href: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/agent/leads` }
    })
  });
}
