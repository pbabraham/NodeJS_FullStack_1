module.exports = function(wagner, sequelize) {
    wagner.factory('AdminManager', function() {
      var AdminManager = require('./AdminManager');
      return new AdminManager(wagner, sequelize);
    });

    wagner.factory('UserManager', function() {
      var UserManager = require('./UserManager');
      return new UserManager(wagner, sequelize);
    });
    
    wagner.factory('AdminPanelManager', function() {
      var AdminPanelManager = require('./AdminPanelManager');
      return new AdminPanelManager(wagner, sequelize);
    });

    wagner.factory('AuthManager', function() {
      var AuthManager = require('./AuthManager');
      return new AuthManager(wagner, sequelize);
    });

    wagner.factory('EventManager', function() {
      var EventManager = require('./EventManager');
      return new EventManager(wagner, sequelize);
    });

    wagner.factory('RegistrationManagementManager', function() {
      var RegistrationManagementManager = require('./RegistrationManagementManager');
      return new RegistrationManagementManager(wagner, sequelize);
    });

    wagner.factory('UserPanelManager', function() {
      var UserPanelManager = require('./UserPanelManager');
      return new UserPanelManager(wagner, sequelize);
    });

    wagner.factory('QnAManager', function() {
      var QnAManager = require('./QnAManager');
      return new QnAManager(wagner, sequelize);
    });

    wagner.factory('TechPanelManager', function() {
      var TechPanelManager = require('./TechPanelManager');
      return new TechPanelManager(wagner, sequelize);
    });

    wagner.factory('ReportManager', function() {
      var ReportManager = require('./ReportManager');
      return new ReportManager(wagner, sequelize);
    });

  }
  
  
