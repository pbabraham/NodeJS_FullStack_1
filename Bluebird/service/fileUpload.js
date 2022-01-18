const multer = require('multer');   //FOR FILE UPLOAD
const fs = require('fs');
const _ = require("lodash");

//------------ meal file upload -------------

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/meal');
	},
	filename: function (req, file, cb) {
		let datetimestamp = Date.now();
		cb(null, Date.now() + "-" + file.originalname);
	}
});

let upload = multer({
	limits: {fileSize: 10000000}, // set limit here (10MB)
	fileFilter: function (req, file, cb) {
		sanitizeFile(file, cb);
	},
	storage: storage
    }).single('file');

let uploadfile = (req, res, next) => {
	//console.log("file upload calling...");
	let path = '';
	upload(req, res, function (err, data) {
		if (err) {
			return res.json({
				code: 403,
				status: "Error",
				message: err.message ? err.message : err
			});
		}
		if (req.file == undefined && !(typeof req.body.file === 'string')) {
			return res.json({
				code: 200,
				status: "Error",
				message: "No file selected!"
			});
		}
		if (req.file) {
			// console.log("body---", req.body);
			// console.log("file", req.file);
		    let path = req.file.path;
			let filename = req.file.filename;
			// console.log("path return", process.env.serverUrl + path.split('public/')[1])
			// console.log("path return", process.env.serverUrl + '/' + filename)
			req.body.image_name = process.env.serverUrl + '/' +  filename;
			req.body.originalname =  req.file.originalname;
			req.body.mimetype = req.file.mimetype;
			next();
		} else {
			req.body.image_name = req.body.file
			next();
		}

	});
}

let deletefile = (filepath) => {
	//console.log("delete filepath--", filepath);
	deletepath = filepath.split(process.env.serverUrl)[1];
	// console.log(deletepath);
	
	fs.unlinkSync("public/meal" + deletepath, function (err) {
		if (err) throw err;
		//console.log("File deleted!");
	});
	return true;
};

function sanitizeFile(file, cb) {

	let fileExts = ['png', 'jpg', 'jpeg', 'gif'];
	let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
	//console.log("isAllowedExt", isAllowedExt);
	if (isAllowedExt) {
		return cb(null, true)
	} else {
		//console.log("in file error....");
		return cb("File type not allowed!", false)
	}
}

//Bulk upload meal
let bulkMealStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/meal');
	},
	filename: function (req, file, cb) {
		let datetimestamp = Date.now();
		cb(null, Date.now() + "-" + file.originalname);
	}
});

function csvFilter(file, cb) {

	let fileExts = ['csv'];
	let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
	//console.log("isAllowedExt", isAllowedExt);
	if (isAllowedExt) {
		return cb(null, true)
	} else {
		//console.log("in file error....");
		return cb("File type not allowed, Please upload only csv file.", false)
	}
}

let bulkUpload = multer({
	limits: {fileSize: 50000000}, // set limit here (50MB)
	fileFilter: function (req, file, cb) {
		csvFilter(file, cb);
	},
	storage: bulkMealStorage
}).single('file');

//---------------- user photo upload -------------

let userstorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/profilephoto');
	},
	filename: function (req, file, cb) {
		let datetimestamp = Date.now();
		cb(null, Date.now() + "-" + file.originalname);
	}
});

let userupload = multer({
	limits: {fileSize: 10000000}, // set limit here (10MB)
	fileFilter: function (req, file, cb) {
		sanitizeFile(file, cb);
	},
	storage: userstorage
    }).single('photo');

let userphotoupload = (req, res, next) => {
	//console.log("file upload calling...");
	let path = '';
	userupload(req, res, function (err, data) {
		if (err) {
			return res.json({
				code: 403,
				status: "Error",
				message: err.message ? err.message : err
			});
		}
		if (req.file == undefined && !(typeof req.body.file === 'string')) {
			return res.json({
				code: 200,
				status: "Error",
				message: "No file selected!"
			});
		}
		if (req.file) {
			//console.log("body---", req.body);
			//console.log("file", req.file);
		    let path = req.file.path;
			let filename = req.file.filename;
			// console.log("path return", process.env.serverUrl + path.split('public/')[1])
			//console.log("path return", process.env.serverUrl + '/' + filename)
			req.body.photo = process.env.serverUrl + '/' +  filename;
			req.body.originalname = req.file.originalname;
			req.body.mimetype = req.file.mimetype;
			next();
		} else {
			next();
		}

	});
}

let deleteuserphoto = (filepath) => {
	//console.log("delete filepath--", filepath);
	deletepath = filepath.split(process.env.serverUrl)[1];
	// console.log(deletepath);
	
	fs.unlinkSync("public/profilephoto" + deletepath, function (err) {
		if (err) throw err;
		//console.log("File deleted!");
	});
	return true;
};

//---------------- bulk delete file --------------

let bulkdeleteuserprofile = (filepath) => {
	// console.log("delete filepath--", filepath)
	for (var i = 0; i < filepath.length; i++) {

		deletepath = filepath[i].split(process.env.serverUrl)[1]

		try {
			fs.unlinkSync("public/profilephoto" + deletepath)
		} catch (e) {
			//console.log(e);
		}
	}
	return true;
}

let bulkdeletefile = (filepath) => {
	//console.log("delete filepath--", filepath)
	// if (typeof filepath === 'string' || filepath instanceof String){
	//   filepath = [filepath]
	// }

	for (var i = 0; i < filepath.length; i++) {

		deletepath = filepath[i].split(process.env.serverUrl)[1]

		try {
			fs.unlinkSync("public/" + deletepath)
		} catch (e) {
			//console.log(e);
		}
	}
	return true;
}

//---------------- user multi photo upload --------

let mediauploads = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './public/media');
		},
		filename: function (req, file, cb) {
			let datetimestamp = Date.now();
			cb(null, Date.now() + "-" + file.originalname);
		}
	})
}).fields([ {
	name: 'photo', maxCount: 4
}])

let usermultiphotoupload = (req, res, next) => {
	let path = '';
	mediauploads(req, res, function (err, data) {
		if (err) {
			return res.json({
				code: 403,
				status: "Error",
				message: err.message ? err.message : err
			});
		}
		// console.log("req-----", req.files)
		// console.log(typeof req.files);
		if (req.body.typecheck == false) {
			next();
		}

		if (!req.files && !req.files['photo']) {
			return res.json({
				code: 403,
				status: "Error",
				message: "No file selected!"
			});
		}
		if (req.files) {
			// console.log("body---", req.body)
			// console.log("file---", req.files['photo'])
			var photoarr = req.files['photo'] ? req.files['photo'] : []
			var photourls = []

			for (var i = 0; i < photoarr.length; i++) {
				var filename = photoarr[i].filename;
				var mimetype = photoarr[i].mimetype;
				var originalname = photoarr[i].originalname;
				var savepath = process.env.serverUrl + '/' +  filename;
				var photoObj = {
					filename : filename,
					mimetype : mimetype,
					originalname : originalname,
					savepath : savepath
				}
				photourls.push(photoObj)
			}

			req.body.userphotourls = photourls;
			next();
		} else {
			next();
		}

	});
}

let mediadeletefile = (filepath) => {
	// console.log("delete filepath--", filepath)
	// console.log("type", typeof filepath);
	// if (typeof filepath === 'string' || filepath instanceof String || typeof filepath === 'object') {
	// 	filepath = [filepath]
	// }

	for (var i = 0; i < filepath.length; i++) {

		var url = filepath[i].savepath;
		//console.log("url",url);
		var deletepath = url.split(process.env.serverUrl)[1]

		try {
			fs.unlinkSync("public/media/" + deletepath)
		} catch (e) {
			//console.log(e);
		}
	}
	return true;
}

//exercise images upload

let exerciseStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/exerciseImages');
	},
	filename: function (req, file, cb) {
		let datetimestamp = Date.now();
		cb(null, Date.now() + "-" + file.originalname);
	}
});

let uploadExercise = multer({
	limits: {fileSize: 10000000}, // set limit here (10MB)
	fileFilter: function (req, file, cb) {
		sanitizeFile(file, cb);
	},
	storage: exerciseStorage
    }).single('icon');

let uploadfileExercise = (req, res, next) => {
	let path = '';
	uploadExercise(req, res, function (err, data) {
		if (err) {
			return res.json({
				code: 403,
				status: "Error",
				message: err.message ? err.message : err
			});
		}
		if (req.file == undefined && !(typeof req.body.file === 'string')) {
			return res.json({
				code: 200,
				status: "Error",
				message: "No file selected!"
			});
		}
		if (req.file) {	
		 next();
		}
		//  else {
		// 	next();
		// }

	});
}

module.exports = {
	uploadfile,
	userphotoupload,
	usermultiphotoupload,
	mediadeletefile,
	deletefile,
	deleteuserphoto,
	bulkdeletefile,
	bulkdeleteuserprofile,
	bulkUpload,
	uploadfileExercise
}
