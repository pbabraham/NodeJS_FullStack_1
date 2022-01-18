let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CmsSchema = mongoose.Schema({
    page_title : { type : String },
    page_slug : { type : String },
    page_content : { type : String },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('cms', CmsSchema, 'cms');
