'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
      await queryInterface.addColumn('events', 'email_body', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'email_header', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'email_footer', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'email_subject', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'email_link', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'message_body', {
        type: Sequelize.STRING,
        allowNull: true
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