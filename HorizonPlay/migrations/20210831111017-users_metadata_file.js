'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('usersmetadatas', {
      id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      event_id : {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
      },
      user_id : {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false
      },
      meta_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      meta_value: {
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

    await queryInterface.addConstraint('usersmetadatas', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'userMetaData_constraints',
      references: { //Required field
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('usersmetadatas', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'eventUserMetaData_constraints',
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
