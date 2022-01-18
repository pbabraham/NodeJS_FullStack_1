const nodemailer = require('nodemailer');

const createUser = async (params) => {
	//console.log("jkfbsbfsdjb",params)
	try {
		let body = `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <body width="100%" style="margin: 0; background-color: #ffffff;">
                        <h2> 🎓 Eurotec</h2>
	              
                    </body>
                </html>`;
			let mailOptions = {
			from: process.env.VERIFIED_EMAIL,
			to: params.email,
			text: 'Successfully Registered',
			html: body,
		};

		mailOptions.subject = 'Hello! 👋 Welcome to Eurotec.';
		sendEmail(mailOptions)
	} catch (err) {
		//console.log("err.............", err)
	}
}

const forgotPassword = async (params) => {
    //console.log("params.......ofrget",params)
    try {
		//console.log("processenv",process.env)
        let newLink = process.env.HOST_URL_APP + 'user/newPassword/' + params._id;
        let body = `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
                  <body>New Password</body>
                </html>`;

            let mailOptions = {
            from: process.env.VERIFIED_EMAIL,
            to: params.email,
            text: 'New Passwod',
            html: body,
        };
        mailOptions.subject = 'Relax! Everyone New Password.';
        sendEmail(mailOptions)
    } catch (err) {

    }
}

const sendEmail = async (mailOptions) => {
	var transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		secureConnection: true,
		port: 465,
		auth: {
			user: process.env.SES_USERNAME,
			pass: process.env.SES_PASSWORD
		}
	});

	transport.sendMail(mailOptions, function (error, response) {
		if (error) {
			//console.log(error);
		} else {
			//console.log("Message sent: " + response.message);
		}
		transport.close();
	});
}

module.exports = {
	createUser,
    forgotPassword
}