'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      role_id: {
        type:   Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 1
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
          type: Sequelize.STRING,
          allowNull: false
      },
      username: {
          type: Sequelize.STRING,
          allowNull: true
      },
      email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
      password: {
          type: Sequelize.TEXT,
          allowNull: true
      },
      isActive: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      }
    });  
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
