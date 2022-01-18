function Response() {
    this.code = 200;
    this.success = true;
    this.message = "";
    this.data = {};
    this.err = "";
}

function successResponse(message, data) {
    let res = new Response();
    res.code = 200;
    res.success = true;
    res.message = message;
    res.data = data;

    return res;
}
//only for bulk upload response
function successResponseBulk(message, data) {
    let res = new Response();
    res.code = 200;
    res.success = true;
    res.message = message;
    res.data = data;

    return res;
}

function successCreateResponse(message, data) {
    let res = new Response();
    res.code = 201;
    res.success = true;
    res.message = message;
    res.data = data;

    return res;
}

function unauthorizedResponse(message, data) {
    let res = new Response();
    res.code = 401;
    res.success = true;
    res.message = message;
    res.data = data;

    return res;
}

function notfoundResponse(message, data) {
    let res = new Response();
    res.code = 404;
    res.success = true;
    res.message = message;
    res.data = data;

    return res;
}

function success1Response(message, data,data2) {
    let res = new Response();
    res.code = 200;
    res.success = true;
    res.message = message;
    res.data = data;
    res.water_data = data2

    return res;
}

function notFound(message, data) {
    let res = new Response();
    res.code = 203;
    res.success = true;
    res.message = message;
    res.data = data;
    res.err = data;

    return res;
}

function failResponse(message, data, err) {

    let res = new Response();
    res.code = 201;
    res.success = false;
    res.message = message;
    res.data = data;
    res.err = err;

    return res;
}


module.exports = {
    successResponse,
    successCreateResponse,
    unauthorizedResponse,
    notfoundResponse,
    success1Response,
    failResponse,
    notFound,
    successResponseBulk
}