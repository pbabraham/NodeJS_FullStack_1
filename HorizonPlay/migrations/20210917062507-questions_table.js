'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.createTable('questions', {
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
      user_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
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

    await queryInterface.addConstraint('questions', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'questionsEvent_constraints',
      references: { //Required field
        table: 'events',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('questions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'questionsUsers_constraints',
      references: { //Required field
        table: 'users',
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
