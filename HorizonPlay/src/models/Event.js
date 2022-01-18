module.exports = (sequelize, DataTypes) => {
    return User = sequelize.define('Event', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        event_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        client_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_manager_email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tech_support_email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        registration_manager_email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        qna_panel_email_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        base_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_registration_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        closed_registration_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        smtp: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        mobile_details_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dynamic_fields: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email_body: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_header: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_footer: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_subject: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email_link: {
            type: DataTypes.STRING,
            allowNull: true
        },
        message_body: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_completed: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0
        },
        off_image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        event_manager_email_password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        tech_support_email_password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        registration_manager_email_password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        qna_panel_email_password: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'events',
        timestamps: true

    });
};
