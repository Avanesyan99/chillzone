import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM || 'CHILLZONE <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ── Password reset email ───────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string;
  userName: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${opts.token}`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Restablecé tu contraseña — CHILLZONE',
    html: passwordResetHtml({ userName: opts.userName, resetUrl }),
    text: passwordResetText({ userName: opts.userName, resetUrl }),
  });

  if (error) {
    console.error('[email] Failed to send password reset:', error);
    throw new Error(error.message);
  }

  return data;
}

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  to: string;
  userName: string;
}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: '¡Bienvenido a CHILLZONE! 🏔️',
    html: welcomeHtml({ userName: opts.userName, appUrl: APP_URL }),
    text: welcomeText({ userName: opts.userName, appUrl: APP_URL }),
  });

  if (error) {
    console.error('[email] Failed to send welcome email:', error);
    // Non-critical — don't throw, just log
  }

  return data;
}

// ── HTML templates ─────────────────────────────────────────────────────────────

function passwordResetHtml({ userName, resetUrl }: { userName: string; resetUrl: string }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;max-width:520px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.12em;color:#f5f3ef;">
              🏔️ CHILL<span style="color:#c4571a;">ZONE</span>
            </p>
            <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,243,239,0.4);">
              Outdoor &amp; Lifestyle Gear
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f3ef;">
              Hola, ${userName} 👋
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:rgba(245,243,239,0.6);line-height:1.7;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta CHILLZONE.
              Si no fuiste vos, podés ignorar este email.
            </p>
            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="border-radius:6px;background:#c4571a;">
                  <a href="${resetUrl}" style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                    Restablecer contraseña
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:rgba(245,243,239,0.4);line-height:1.6;">
              O copiá este enlace en tu navegador:
            </p>
            <p style="margin:0 0 24px;font-size:11px;color:rgba(196,87,26,0.8);word-break:break-all;font-family:monospace;background:rgba(255,255,255,0.04);padding:10px 12px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);">
              ${resetUrl}
            </p>
            <p style="margin:0;font-size:12px;color:rgba(245,243,239,0.35);line-height:1.6;">
              ⏱ Este enlace expira en <strong style="color:rgba(245,243,239,0.5);">30 minutos</strong>.<br>
              Si no solicitaste restablecer tu contraseña, no necesitás hacer nada.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(245,243,239,0.25);line-height:1.7;">
              CHILLZONE — Outdoor &amp; Lifestyle Gear<br>
              Buenos Aires, Argentina
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function passwordResetText({ userName, resetUrl }: { userName: string; resetUrl: string }) {
  return `Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta CHILLZONE.

Para restablecerla, abrí este enlace en tu navegador:
${resetUrl}

Este enlace expira en 30 minutos.

Si no solicitaste restablecer tu contraseña, podés ignorar este email.

---
CHILLZONE — Outdoor & Lifestyle Gear
Buenos Aires, Argentina`;
}

function welcomeHtml({ userName, appUrl }: { userName: string; appUrl: string }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;max-width:520px;width:100%;">
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.12em;color:#f5f3ef;">
              🏔️ CHILL<span style="color:#c4571a;">ZONE</span>
            </p>
            <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,243,239,0.4);">
              Outdoor &amp; Lifestyle Gear
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f3ef;">
              ¡Bienvenido, ${userName}! 🎉
            </p>
            <p style="margin:0 0 20px;font-size:14px;color:rgba(245,243,239,0.6);line-height:1.7;">
              Tu cuenta en CHILLZONE está lista. Ya podés explorar el catálogo, agregar productos al carrito y hacer tus pedidos directamente por WhatsApp.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="border-radius:6px;background:#c4571a;">
                  <a href="${appUrl}" style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                    Ver catálogo
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:12px;color:rgba(245,243,239,0.35);line-height:1.7;">
              Stay Refreshed. Go Anywhere. 🏕️
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:11px;color:rgba(245,243,239,0.25);line-height:1.7;">
              CHILLZONE — Outdoor &amp; Lifestyle Gear<br>Buenos Aires, Argentina
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function welcomeText({ userName, appUrl }: { userName: string; appUrl: string }) {
  return `¡Bienvenido a CHILLZONE, ${userName}!

Tu cuenta está lista. Explorá el catálogo en: ${appUrl}

Stay Refreshed. Go Anywhere.

---
CHILLZONE — Outdoor & Lifestyle Gear`;
}
