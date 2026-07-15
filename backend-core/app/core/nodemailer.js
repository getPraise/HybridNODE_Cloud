import nodemailer from "nodemailer";
import "dotenv/config";

// 1. Create the Transporter with Performance Pooling
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  pool: true, // Professional touch: keeps connection open for faster OTP dispatch
  auth: {
    user: (process.env.SMTP_USER || "").trim(),
    pass: (process.env.SMTP_PASS || "").trim(),
  },
  // Safety timeouts
  connectionTimeout: 10000,
  greetingTimeout: 5000,
});

// 2. Silent Validation Logic
// We only verify if credentials exist to avoid cluttering the logs during dev
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error(`[MAILER ERROR]: ${error.message}`);
      console.log(`DEBUG: SMTP_PASS length is ${process.env.SMTP_PASS.length}`);
    } else {
      console.log("📧 MAILER SYSTEM : ONLINE (READY TO DISPATCH)");
    }
  });
} else {
  console.warn("⚠️ MAILER SYSTEM : OFFLINE (MISSING CREDENTIALS)");
}

export default transporter;
