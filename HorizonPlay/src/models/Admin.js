module.exports = (sequelize, DataTypes) => {
    return Otp = sequelize.define('Admin', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          role_id: {
            type:   DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
          },
          first_name: {
            type: DataTypes.STRING,
            allowNull: false
          },
          last_name: {
              type: DataTypes.STRING,
              allowNull: false
          },
          username: {
              type: DataTypes.STRING,
              allowNull: true
          },
          email: {
              type: DataTypes.TEXT,
              allowNull: false,
              unique: true,
          },
          password: {
              type: DataTypes.TEXT,
              allowNull: true
          },
          isActive: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
          },
    }, {
        tableName: 'admins',
        timestamps: true
    });
};
  