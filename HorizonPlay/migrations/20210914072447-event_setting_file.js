'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

     await queryInterface.createTable('event_settings', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      event_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
      },
      chat: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      toplogos: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      bottomlogos: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ask_speaker: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      poll: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      photobooth: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attendee_list: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      login_background: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      streaming_page: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      theme_color: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      agenda : {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tech_support : {
        type: Sequelize.TEXT,
        allowNull: true
      },
      feedback : {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resources: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notification: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addConstraint('event_settings', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'eventsetting_constraints_name',
      references: { //Required field
        table: 'events',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
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
