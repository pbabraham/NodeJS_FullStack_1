'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

     await queryInterface.addColumn('questions', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });

     await queryInterface.addColumn('questions', 'submit_time', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'),
      allowNull: false
    });

    await queryInterface.addColumn('questions', 'date', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('questions', 'device_type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('questions', 'operating_system', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('questions', 'browser', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('questions', 'ip', {
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
