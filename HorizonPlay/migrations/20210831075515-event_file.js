'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      event_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      client_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_manager_email_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tech_support_email_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registration_manager_email_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      qna_panel_email_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_slug: {
        type: Sequelize.STRING,
        allowNull: false
      },
      base_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_registration_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      closed_registration_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      smtp: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mobile_details_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dynamic_fields: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_completed: {
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
