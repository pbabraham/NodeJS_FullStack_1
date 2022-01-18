'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      role_id: {
        type:   Sequelize.ENUM("2","3","4","5","6")
      },
      event_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
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
      },
      password: {
          type: Sequelize.TEXT,
          allowNull: true
      },
      profile_img: {
          type: Sequelize.STRING,
          allowNull: true
      },
      islogin: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          defaultValue: 0
      },
      on_spot_reister: {
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

    await queryInterface.addConstraint('users', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'event_constraints_name',
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
