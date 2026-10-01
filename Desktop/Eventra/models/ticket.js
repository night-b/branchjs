const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ticket_type_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ticket_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qr_code_url: {
    type: DataTypes.TEXT,
  },
  qr_content: {
    type: DataTypes.TEXT,
  },
});

module.exports = Ticket;