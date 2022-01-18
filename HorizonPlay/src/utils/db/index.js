const Sequelize = require('sequelize');
var config = require('config');
const dbconfig  = config.get('db');

module.exports  = function(wagner) {
	
    return new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, dbconfig.options);
}