exports.decodeBase64Data = async function (dataString) {

    try {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        var response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        return response;

    } catch (e) {
        // Log Errors
        throw Error('Error while decoding worker' + e)
    }
}