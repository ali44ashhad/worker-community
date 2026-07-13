import nodemailer from "nodemailer";

function env(name) {
    return (process.env[name] || "").trim();
}

const smtpHost = env("SMTP_HOST");
const smtpPort = Number(env("SMTP_PORT") || "587");
const smtpUser = env("SMTP_USER");
const smtpPass = env("SMTP_PASS");

const transporter =
    smtpHost && smtpUser && smtpPass
        ? nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                  user: smtpUser,
                  pass: smtpPass,
              },
              connectionTimeout: 15_000,
              greetingTimeout: 15_000,
              socketTimeout: 20_000,
          })
        : null;

export function getSmtpFromEmail() {
    return env("SMTP_FROM") || smtpUser;
}

export function isSmtpConfigured() {
    return Boolean(transporter && getSmtpFromEmail());
}

/** Safe status for startup logs (no secrets). */
export function getSmtpStatus() {
    return {
        configured: isSmtpConfigured(),
        host: smtpHost || null,
        port: smtpPort,
        userSet: Boolean(smtpUser),
        passSet: Boolean(smtpPass),
        from: getSmtpFromEmail() || null,
        missing: [
            !smtpHost && "SMTP_HOST",
            !smtpUser && "SMTP_USER",
            !smtpPass && "SMTP_PASS",
            !getSmtpFromEmail() && "SMTP_FROM (or SMTP_USER)",
        ].filter(Boolean),
    };
}

export default transporter;
