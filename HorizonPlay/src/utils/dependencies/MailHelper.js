var nodemailer = require('nodemailer');
const config = require('config');
const transport = nodemailer.createTransport({
    host: config.email.MAIL_HOST,
    port: config.email.MAIL_PORT,
    auth: {
        user: config.email.MAIL_USERNAME,
        pass: config.email.MAIL_PASSWORD
    }
});

class MailHelper {

    constructor(wagner) {
    }

    async sendMail (params) {
        let mailOptions = params;
        let sendMailfun = await transport.sendMail(mailOptions);
        if (!sendMailfun) {
            return({
                success : false,
                status: 400,
                message: "error",
            })  
        } else {
            return({
                success : true,
                status: 200,
                message: "Mail sent",
            }) 
        }         
    }      
}

module.exports = MailHelper