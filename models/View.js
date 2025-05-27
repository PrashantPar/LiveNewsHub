// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');

// const View = sequelize.define('View', {
//     viewedAt: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW
//     }
// });

// module.exports = View;

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const View = sequelize.define('View', {
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = View;
