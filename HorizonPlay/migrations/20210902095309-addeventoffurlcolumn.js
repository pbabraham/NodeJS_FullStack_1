'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
      await queryInterface.addColumn('events', 'off_image_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'event_manager_email_password', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'tech_support_email_password', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'registration_manager_email_password', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('events', 'qna_panel_email_password', {
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
