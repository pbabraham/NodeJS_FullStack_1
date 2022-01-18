'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('pollquestions', {
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
      question_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_options: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      right_answer: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_active: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
        allowNull: false
      },
      is_visible: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
        allowNull: false
      },
      is_poll_result: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
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

    await queryInterface.addConstraint('pollquestions', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'pollquestionsEvent_constraints_name',
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
