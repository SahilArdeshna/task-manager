const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "sahilardeshnaportfolio@gmail.com",
    subject: "Thanks for joining in.",
    text: `Welcome to the app, ${name.toUpperCase()}.`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "sahilardeshnaportfolio@gmail.com",
    subject: "Account cancelation mail",
    text: `Hope you enjoyed our services, ${name.toUpperCase()}.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
