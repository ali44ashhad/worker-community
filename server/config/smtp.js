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
          })
        : null;

export function getSmtpFromEmail() {
    return env("SMTP_FROM") || smtpUser;
}

export function isSmtpConfigured() {
    return Boolean(transporter && getSmtpFromEmail());
}

export default transporter;
