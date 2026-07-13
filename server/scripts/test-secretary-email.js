import "dotenv/config";
import { sendSecretaryNewSignupEmail } from "../utils/email.js";
import { getSmtpStatus } from "../config/smtp.js";

const status = getSmtpStatus();
console.log("SMTP status:", status);

if (!status.configured) {
  console.error("Cannot test — SMTP not configured.");
  process.exit(1);
}

const to = (process.argv[2] || status.from || "").trim().toLowerCase();
if (!to) {
  console.error("Usage: node scripts/test-secretary-email.js you@example.com");
  process.exit(1);
}

const result = await sendSecretaryNewSignupEmail({
  toEmail: to,
  communityCommunName: "sainik-farms",
  memberName: "Test Member",
  memberEmail: "test.member@example.com",
  memberPhone: "9999999999",
});

console.log("Result:", result);
process.exit(result.sent ? 0 : 1);
