'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

     await queryInterface.createTable('userloginanalytics', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      role_id: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      event_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
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
        allowNull: false
      },
      login_date_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: true
      },
      logout_date_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      device_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      operating_system: {
        type: Sequelize.STRING,
        allowNull: false
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: false
      },
      islogout: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      on_spot_reister: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      is_approved: {
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

    await queryInterface.addConstraint('userloginanalytics', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'userloginanalyticsEvent_constraints',
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
