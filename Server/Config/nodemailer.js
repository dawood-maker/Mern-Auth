// import nodemailer from "nodemailer";

// const transport = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com", // Brevo SMTP
//   port: 587,                     // 587 for TLS
//   secure: false,                 // ❌ 587 ke liye false
//   auth: {
//     user: process.env.SMTP_USER, // apna email
//     pass: process.env.SMTP_PASS, // apna password
//   },
// });

// export default transport;







import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transport;