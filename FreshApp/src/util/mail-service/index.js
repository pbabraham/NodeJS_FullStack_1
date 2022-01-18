//! nodemaler strart
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
// const user = require("../modal/userDB");

let eMail = (email, subject, text) => {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "",
        pass: "",
      },
      secure:true,
    })
  );

  var mailOptions = {
    from: "",
    to: `${email}`,
    subject: `${subject}`,
    // html:`<b>Thsis is valid for only 1 hour</b><br><a href="http://${text}"</a>`,
    text: `${text}`,
    // attachments: [{
    //   filename: 'alians.pdf',
    //   path: '/',
    //   contentType: 'application/pdf'
    // }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
//! nodemailer end`



module.exports = eMail;
