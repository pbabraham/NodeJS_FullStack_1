let FCM = require('fcm-push');
const bcrypt = require('bcryptjs');

const nodemailer = require("nodemailer");

let randomStringGenerator = function () {
	let text = "";
	let possible = "0123456789";
	for (let i = 0; i < 7; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};

function password_generator( len ) {
    var length = (len)?(len):(8);
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var numeric = '0123456789';
    var punctuation = 'ABCDEFGHIJKLMNOPQRSTWXYZ';
    var password = "";
    var character = "";
    var crunch = true;
    while( password.length<length ) {
        entity1 = Math.ceil(string.length * Math.random()*Math.random());
        entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
        hold = string.charAt( entity1 );
        hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
        character += hold;
        character += numeric.charAt( entity2 );
        character += punctuation.charAt( entity3 );
        password = character;
    }
    password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
    return password.substr(0,len);
}

let emailValidator = (params) => {
	let mailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (mailFormat.test(params) == false) {
		return false
	} else {
		return true
	}
};

let randomNumber = () => {
	let text = "";
	let possible = "0123456789";
	for (let i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

let pushNotigication = (userArray, msg) => {

	let fcm = new FCM(process.env.pushNotificationServerKey);
	let arrays = userArray.map(function (user) {
		if (user.deviceId) {
			let message = {
				to: user.deviceId, // required fill with device token or topics
				collapse_key: 'your_collapse_key',
				data: {
					"title": "Notification from PGYM ",
					"body": msg
				},
				notification: {
					title: 'PGYM',
					body: msg
				}
			};
			//promise style
			fcm.send(message)
				.then(function (response) {
					//console.log("Successfully sent with response: ", response);
				})
				.catch(function (err) {
					//console.log("Something has gone wrong!");
					//console.error(err);
				})
		}
	});
}

let sendMail = function (params) {

	return new Promise((resolve, reject) => {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			host: 'smtp.gmail.com',
			// port: 465,
			// secure: true,
			auth: {
				user: process.env.user1,
				pass: process.env.password1
			},
			logger: true,
			debug: false
		});
		const mailOptions = {
			from: "mealid.fit@gmail.com",
			to: `${params.email}`,
			subject: "Meal Plan Account Password Recovery",
			text: params.message
		};
		transporter.sendMail(mailOptions, function (err, response) {
			if (err) {
				reject(err);
			} else {
				resolve(response);
			}
		});
	});
};


let generateHash = function (password) {

	//console.log("In-GenerateHash-Function");
	var hashpass = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
	//console.log("hashpass--", hashpass)
	return hashpass;
};

module.exports = {
	emailValidator,
	randomNumber,
	pushNotigication,
	randomStringGenerator,
	sendMail,
	generateHash,
	password_generator
};
