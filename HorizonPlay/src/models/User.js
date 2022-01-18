module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        event_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,

        },
        role_id: {
            type:   DataTypes.ENUM("2","3","4","5","6")
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
            primaryKey: true,

        },
        password: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        profile_img: {
            type: DataTypes.STRING,
            allowNull: true
        },
        islogin: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        on_spot_reister: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        mobile_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_approved: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        }
    }, {  
           
        tableName: 'users',
        timestamps: true,
    });
    User.associate = function(models) {
        User.hasMany(models.Question, {
            foreignKey: 'id'
        });
        User.hasMany(models.SubmitPollResult, {
            foreignKey: 'id'
        });
    };

    return User;
};
