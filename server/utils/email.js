import transporter, { getSmtpFromEmail, isSmtpConfigured, getSmtpStatus } from "../config/smtp.js";
import { formatCommunDisplayName } from "./communName.js";
import { getFrontendBase } from "./frontendUrl.js";

let loggedSmtpMisconfig = false;

function escapeHtml(input) {
    return String(input ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

function getBrand() {
    // Match client theme vars (purple → magenta) with solid fallback
    return {
        name: (process.env.BRAND_NAME || "CommuN").trim(),
        primary: "#6b46c1",
        secondary: "#d946ef",
        text: "#1a1a2e",
        muted: "#475569",
        bg: "#fafbfc",
        cardBorder: "rgba(107,70,193,0.18)",
        buttonText: "#ffffff",
    };
}

function renderEmailLayout({
    preheader,
    title,
    introHtml,
    detailsRows,
    cta,
    footerNote,
}) {
    const brand = getBrand();
    const safeTitle = escapeHtml(title);
    const safePreheader = escapeHtml(preheader || "");
    const safeFooter = escapeHtml(footerNote || "");

    const detailsHtml = Array.isArray(detailsRows) && detailsRows.length
        ? `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px;border-collapse:collapse">
            ${detailsRows
                .map(
                    (r) => `
              <tr>
                <td style="padding:10px 12px;border:1px solid rgba(107,70,193,0.12);border-right:none;border-radius:12px 0 0 12px;background:rgba(107,70,193,0.06);font-weight:600;color:${brand.text};width:160px">
                  ${escapeHtml(r.label)}
                </td>
                <td style="padding:10px 12px;border:1px solid rgba(107,70,193,0.12);border-left:none;border-radius:0 12px 12px 0;background:#ffffff;color:${brand.text}">
                  ${r.valueHtml}
                </td>
              </tr>`
                )
                .join("")}
          </table>
        `
        : "";

    const ctaHref = cta?.href ? String(cta.href).trim() : "";
    const ctaHtml = ctaHref
        ? `
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:18px 0 0">
            <tr>
              <td align="left" style="border-radius:12px;background:${brand.primary}">
                <a href="${ctaHref}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="display:inline-block;background:linear-gradient(90deg, ${brand.primary}, ${brand.secondary});color:${brand.buttonText};text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;line-height:1.2;mso-padding-alt:0">
                  ${escapeHtml(cta.label || "Open")}
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:${brand.muted};word-break:break-all">
            If the button does not work, open this link:<br />
            <a href="${ctaHref}" target="_blank" rel="noopener noreferrer" style="color:${brand.primary};font-weight:600">${escapeHtml(ctaHref)}</a>
          </p>
        `
        : "";

    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:${brand.bg};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${safePreheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:${brand.bg};padding:0;margin:0">
      <tr>
        <td align="center" style="padding:28px 14px">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:0 0 14px;">
                <div style="text-align:center">
                  <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${brand.muted};font-family:Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif">
                    ${escapeHtml(brand.name)}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:linear-gradient(110deg, ${brand.primary}, ${brand.secondary});border-radius:18px 18px 0 0;padding:18px 20px">
                <div style="font-family:Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;font-size:18px;font-weight:800;color:#ffffff;line-height:1.3">
                  ${safeTitle}
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;border:1px solid ${brand.cardBorder};border-top:none;border-radius:0 0 18px 18px;padding:20px 20px 18px;font-family:Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;color:${brand.text};">
                <div style="font-size:14px;line-height:1.65;color:${brand.text}">
                  ${introHtml || ""}
                </div>

                ${detailsHtml}
                ${ctaHtml}

                ${
                    safeFooter
                        ? `<div style="margin-top:18px;font-size:12px;line-height:1.55;color:${brand.muted}">
                             ${safeFooter}
                           </div>`
                        : ""
                }
              </td>
            </tr>

            <tr>
              <td style="padding:14px 8px 0;text-align:center;font-family:Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif;font-size:11px;line-height:1.5;color:${brand.muted}">
                <div>This is an automated email from ${escapeHtml(brand.name)}.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
}

function isPlausibleRecipientEmail(email) {
    const to = String(email || "").trim().toLowerCase();
    if (!to) return false;
    // Basic shape
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
    const [local, domain] = to.split("@");
    // Block obvious placeholders that always bounce (e.g. d@gmail.com)
    if (!local || local.length < 2) return false;
    if (/^(test|dummy|fake|asdf|xyz|abc|noreply|no-reply)$/i.test(local)) return false;
    if (/(^|\.)example\.(com|org|net)$/i.test(domain)) return false;
    return true;
}

async function sendEmail({ toEmail, subject, text, html }) {
    if (!isSmtpConfigured()) {
        if (!loggedSmtpMisconfig) {
            loggedSmtpMisconfig = true;
            const status = getSmtpStatus();
            console.error(
                "[email] SMTP is not configured — approval/notification emails will NOT be sent.",
                "Missing:",
                status.missing.join(", ") || "(unknown)",
                "Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_FROM, SMTP_PORT) on the server, then restart PM2."
            );
        }
        return { sent: false, reason: "smtp_not_configured" };
    }

    const from = getSmtpFromEmail();
    const to = String(toEmail || "").trim().toLowerCase();
    if (!to) {
        console.error("[email] Refusing to send — empty recipient.", { subject });
        return { sent: false, reason: "missing_recipient" };
    }
    if (!isPlausibleRecipientEmail(to)) {
        console.error("[email] Refusing to send — invalid/placeholder recipient.", { to, subject });
        return { sent: false, reason: "invalid_recipient" };
    }

    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
        console.log("[email] Sent:", {
            to,
            subject,
            messageId: info?.messageId || null,
        });
        return { sent: true, messageId: info?.messageId || null };
    } catch (err) {
        console.error("[email] sendMail failed:", {
            to,
            subject,
            message: err?.message || String(err),
            code: err?.code || null,
            responseCode: err?.responseCode || null,
        });
        throw err;
    }
}

export async function sendPasswordResetEmail({ toEmail, resetUrl }) {
    const subject = "Reset your password";
    const text = `Reset your password using this link: ${resetUrl}`;
    const html = renderEmailLayout({
        preheader: "Reset your password",
        title: "Reset your password",
        introHtml:
            "<p style=\"margin:0 0 10px\">Click the button below to set a new password.</p>",
        cta: { href: resetUrl, label: "Reset Password" },
        footerNote: "If you did not request this, you can ignore this email.",
    });

    return await sendEmail({ toEmail, subject, text, html });
}

export async function sendSecretaryNewSignupEmail({
    toEmail,
    communityCommunName,
    memberName,
    memberEmail,
    memberPhone,
}) {
    const communityLabel = formatCommunDisplayName(communityCommunName) || communityCommunName;
    const subject = `New signup pending approval (${communityLabel})`;
    const text = `A new member signed up in your community (${communityLabel}) and is pending approval.\n\nName: ${memberName}\nEmail: ${memberEmail}\nPhone: ${memberPhone || "-"}\n\nPlease log in to review pending registrations.`;
    const frontendBase = getFrontendBase();
    const reviewsUrl = `${frontendBase.replace(/\/+$/, "")}/secretary/approvals`;
    const html = renderEmailLayout({
        preheader: `New signup in ${communityLabel}`,
        title: "New signup pending approval",
        introHtml: `<p style="margin:0 0 10px">A new member signed up in your community <b>${escapeHtml(
            communityLabel
        )}</b> and is pending approval.</p>`,
        detailsRows: [
            { label: "Name", valueHtml: escapeHtml(memberName) },
            {
                label: "Email",
                valueHtml: `<a href="mailto:${encodeURIComponent(memberEmail)}" style="color:#6b46c1;text-decoration:none;font-weight:700">${escapeHtml(
                    memberEmail
                )}</a>`,
            },
            { label: "Phone", valueHtml: escapeHtml(memberPhone || "-") },
        ],
        cta: { href: reviewsUrl, label: "Review Pending" },
        footerNote:
            "If the link doesn’t open, log in to your secretary dashboard and open “Approvals”.",
    });
    return await sendEmail({ toEmail, subject, text, html });
}

export async function sendUserRegistrationApprovedEmail({ toEmail, communityCommunName }) {
    const frontendBase = getFrontendBase();
    const loginUrl = `${frontendBase.replace(/\/+$/, "")}/login`;
    const communityLabel = formatCommunDisplayName(communityCommunName) || communityCommunName;
    const subject = "Your account has been approved";
    const text = `Good news — your registration for community (${communityLabel}) has been approved.\n\nYou can log in here: ${loginUrl}`;
    const html = renderEmailLayout({
        preheader: "Your account has been approved",
        title: "Account approved",
        introHtml: `<p style="margin:0 0 10px">Good news — your registration for community <b>${escapeHtml(
            communityLabel
        )}</b> has been approved.</p>
                   <p style="margin:0">You can log in now.</p>`,
        cta: { href: loginUrl, label: "Log in" },
    });
    return await sendEmail({ toEmail, subject, text, html });
}

export async function sendUserRegistrationRejectedEmail({ toEmail, communityCommunName }) {
    const communityLabel = formatCommunDisplayName(communityCommunName) || communityCommunName;
    const subject = "Your registration was not approved";
    const text = `Your registration for community (${communityLabel}) was not approved. If you think this is a mistake, please contact your community secretary.`;
    const html = renderEmailLayout({
        preheader: "Your registration was not approved",
        title: "Registration not approved",
        introHtml: `<p style="margin:0 0 10px">Your registration for community <b>${escapeHtml(
            communityLabel
        )}</b> was not approved.</p>
                   <p style="margin:0">If you think this is a mistake, please contact your community secretary.</p>`,
    });
    return await sendEmail({ toEmail, subject, text, html });
}
