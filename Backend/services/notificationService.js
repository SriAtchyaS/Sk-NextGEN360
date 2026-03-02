const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendManagerReport = async (to, subject, text, icsContent = null) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments: []
  };

  if (icsContent) {
    mailOptions.attachments.push({
      filename: "review-meeting.ics",
      content: icsContent
    });
  }

  await transporter.sendMail(mailOptions);
};