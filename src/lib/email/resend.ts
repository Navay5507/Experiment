import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'AutoDrop <noreply@autodrop.in>';

export async function sendPlanExpiryWarning(to: string, name: string, daysLeft: number) {
  const subject = daysLeft === 1
    ? '⚠️ Your AutoDrop Pro plan expires tomorrow!'
    : `⏳ Your AutoDrop Pro plan expires in ${daysLeft} days`;

  const renewUrl = 'https://autodrop.in/pricing';

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0F172A;font-family:'Segoe UI',Arial,sans-serif;color:#F8FAFC;">
          <div style="max-width:560px;margin:40px auto;background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
            <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">AutoDrop</h1>
            </div>
            <div style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#F1F5F9;">
                ${daysLeft === 1 ? 'Your plan expires tomorrow!' : `Your plan expires in ${daysLeft} days`}
              </h2>
              <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${name || 'there'}, your AutoDrop Pro subscription is expiring soon. 
                Once it expires, your automations will be paused and you'll be moved to the Free plan 
                (limited to 1 active automation).
              </p>
              <a href="${renewUrl}" 
                 style="display:inline-block;background:linear-gradient(135deg,#6B7CFF,#4F46E5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;">
                Renew Pro Now →
              </a>
              <p style="color:#64748B;font-size:13px;margin:24px 0 0;">
                Questions? Reply to this email or visit <a href="https://autodrop.in/support" style="color:#818CF8;">autodrop.in/support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPlanExpiredEmail(to: string, name: string) {
  const renewUrl = 'https://autodrop.in/pricing';

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: '🔴 Your AutoDrop Pro plan has expired — automations paused',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#0F172A;font-family:'Segoe UI',Arial,sans-serif;color:#F8FAFC;">
          <div style="max-width:560px;margin:40px auto;background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
            <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">AutoDrop</h1>
            </div>
            <div style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#F1F5F9;">Your Pro plan has expired</h2>
              <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${name || 'there'}, your AutoDrop Pro subscription has expired. 
                We've paused your extra automations and moved your account to the Free tier 
                to keep your most recent automation running. 
                No data has been deleted — renew anytime to instantly restore everything.
              </p>
              <a href="${renewUrl}" 
                 style="display:inline-block;background:linear-gradient(135deg,#6B7CFF,#4F46E5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;">
                Renew Pro — Restore All Automations →
              </a>
              <p style="color:#64748B;font-size:13px;margin:24px 0 0;">
                Questions? Reply to this email or visit <a href="https://autodrop.in/support" style="color:#818CF8;">autodrop.in/support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
