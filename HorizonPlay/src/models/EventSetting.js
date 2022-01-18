module.exports = (sequelize, DataTypes) => {
    return EventSetting = sequelize.define('EventSetting', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          event_id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            allowNull: false
          },
          chat: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          toplogos: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          bottomlogos: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          streaminglogos: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          ask_speaker: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          poll: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          photobooth: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          attendee_list: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          login_background: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          streaming_page: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          theme_color: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          agenda : {
            type: DataTypes.TEXT,
            allowNull: true
          },
          tech_support: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          feedback : {
            type: DataTypes.TEXT,
            allowNull: true
          },
          resources: {
            type: DataTypes.TEXT,
            allowNull: true
          },
          notification: {
            type: DataTypes.TEXT,
            allowNull: true
          },
    }, {
        tableName: 'event_settings',
        timestamps: true
    });
};
  