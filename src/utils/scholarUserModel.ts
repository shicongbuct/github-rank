import path from 'path';
import { Model, Sequelize, DataTypes, BuildOptions } from 'sequelize';

// const dbPath = `../../database/scholarUserData.sqlite`;
const dbPath = path.join(__dirname, '../../database/scholarUserData.sqlite')
//console.log(dbPath);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath
});

interface ScholarUserSQL extends Model {
    id: string;
    name: string;
    desc: string;
    page_url: string;
    cite: string;
    major: string;
    photo: string;
    h_index: string;
    i10_index: string;
    cite_2014: string;
    h_index_2014: string;
    i10_index_2014: string;
}

type ScholarUserSQLStatic = typeof Model & {
    new (values?: object, options?: BuildOptions): ScholarUserSQL;
}

export const ScholarUserModel = <ScholarUserSQLStatic>sequelize.define('scholarUser', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING,
    },
    name: {
        type: DataTypes.STRING
    },
    desc: {
        type: DataTypes.STRING
    },
    page_url: {
        type: DataTypes.STRING
    },
    cite: {
        type: DataTypes.STRING
    },
    major: {
        type: DataTypes.STRING
    },
    photo: {
        type: DataTypes.STRING
    },
    h_index: {
        type: DataTypes.STRING
    },
    i10_index: {
        type: DataTypes.STRING
    },
    cite_2014: {
        type: DataTypes.STRING
    },
    h_index_2014: {
        type: DataTypes.STRING
    },
    i10_index_2014: {
        type: DataTypes.STRING
    }
});


