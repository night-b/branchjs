const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttendanceLog = sequelize.define('AttendanceLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = AttendanceLog;