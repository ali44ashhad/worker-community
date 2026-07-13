const path = require("path");
const dotenv = require("dotenv");

// Ensure SMTP_* from server/.env are available to PM2 (`pm2 reload --update-env`).
dotenv.config({ path: path.join(__dirname, ".env") });

function pickEnv(keys) {
  const out = {};
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && String(value).trim() !== "") {
      out[key] = value;
    }
  }
  return out;
}

module.exports = {
  apps: [
    {
      name: "commun-api",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        ...pickEnv([
          "SMTP_HOST",
          "SMTP_PORT",
          "SMTP_USER",
          "SMTP_PASS",
          "SMTP_FROM",
          "FRONTEND_URL",
          "BRAND_NAME",
        ]),
      },
    },
  ],
};
