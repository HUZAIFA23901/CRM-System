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

function wrapHtml(title: string, content: string) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>${title}</h2>
    <div>${content}</div>
  </div>`;
}

export async function sendLeadCreatedEmail(to: string, leadName: string) {
  if (!process.env.SMTP_HOST) return;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `New Lead Created: ${leadName}`,
    html: wrapHtml("New Lead Created", `<p>Lead <strong>${leadName}</strong> was created in CRM.</p>`)
  });
}

export async function sendLeadAssignedEmail(to: string, leadName: string) {
  if (!process.env.SMTP_HOST) return;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Lead Assigned: ${leadName}`,
    html: wrapHtml("Lead Assignment", `<p>You have been assigned lead <strong>${leadName}</strong>.</p>`)
  });
}
