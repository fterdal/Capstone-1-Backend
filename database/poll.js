const { DataTypes } = require("sequelize");
const db = require("./db");
const { DESCRIBE } = require("sequelize/lib/query-types");


const Polls = db.define ("polls" ,
    {
        id:
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id:
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title:
        {
            type: DataTypes.VARCHAR,
            allowNull: false,
        },
        Description:
        {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive:
        {
            type: DataTypes.BOOLEAN
        },
        createdAt:
        {
            type: DataTypes.DATE
        }
    })

    
// Table polls {
//   id int [pk, increment]
//   user_id int [ref: > users.id]
//   title varchar [not null]
//   description text
//   is_active boolean [default: true]
//   created_at datetime
// }

module.exports = Polls;