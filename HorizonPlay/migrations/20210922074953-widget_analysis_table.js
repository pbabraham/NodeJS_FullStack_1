'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

     await queryInterface.createTable('widgetanalysis', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      event_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      click_timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: false
      },
      date: {
        type: Sequelize.STRING,
        allowNull: true
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      operating_system: {
        type: Sequelize.STRING,
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resource_download: {
        type: Sequelize.STRING,
        allowNull: true
      },
      widget_type: {
        type: Sequelize.STRING,
        allowNull: false
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

    await queryInterface.addConstraint('widgetanalysis', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'widgetanalysisEvent_constraints',
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
