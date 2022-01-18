'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('chats', {
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
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      chat_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sender_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
      },
      reciver_id: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
        allowNull: true
      },
      is_seen: {
        type: Sequelize.INTEGER(11),
        defaultValue: 1,
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

    await queryInterface.addConstraint('chats', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'chatEvent_constraints_name',
      references: { //Required field
        table: 'events',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('chats', {
      fields: ['sender_id'],
      type: 'foreign key',
      name: 'chatUser_constraints_name',
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
