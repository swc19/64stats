import pkg from 'sequelize';
import dotenv from 'dotenv';

const {Sequelize, DataTypes} = pkg;

dotenv.config();

const database = process.env.PG_DB_NAME;
const password = process.env.PG_DB_PASSWORD;
const user = process.env.PG_USER;
export const api_key = process.env.API_KEY;
export const path = 'http://localhost:3000';

const sequelize = new Sequelize(database, user, password, {
    dialect: 'postgres',
    host: 'localhost',
    port: process.env.PG_DB_PORT,
    logging: false,
});

const Tournament = sequelize.define('Tournament',{
    tourney_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    tourney_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tourney_country: {
        type: DataTypes.STRING,
    },
    tourney_location: {
        type: DataTypes.STRING,
    },
    tourney_start_time: {
        type: DataTypes.DATE,
    },
    tourney_entrants: {
        type: DataTypes.INTEGER,
    },
    tourney_slug: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

const Player = sequelize.define('Player', {
    player_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    player_tag: {
        type: DataTypes.STRING
    },
    player_realname: {
        type: DataTypes.STRING
    },
    player_country: {
        type: DataTypes.STRING
    },
    player_twitch: {
        type: DataTypes.STRING
    },
    player_twitter: {
        type: DataTypes. STRING
    }
},{
    sequelize,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

const Set = sequelize.define('Set', {
    set_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    set_completed_at: {
        type: DataTypes.DATE,
    },
    set_bracket_location: {
        type: DataTypes.STRING
    },
    tourney_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Tournament',
            key: 'tourney_id'
        }
    },
    event_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Event',
            key: 'event_id'
        }
    },
    set_lPlacement: {
        type: DataTypes.INTEGER
    },
    winner_id: {
        type: DataTypes.INTEGER,
        // references: {
        //     model: 'Player',
        //     key: 'player_id'
        // }
    },
    entrant_0: {
        type: DataTypes.INTEGER,
        // references: {
        //     model: 'Player',
        //     key: 'player_id'
        // }
    },
    entrant_0_tag: {
        type: DataTypes.STRING
    },
    entrant_1: {
        type: DataTypes.INTEGER,
        // references: {
        //     model: 'Player',
        //     key: 'player_id'
        // }
    },
    entrant_1_tag: {
        type: DataTypes.STRING
    },
    entrant_0_score: {
        type: DataTypes.STRING
    },
    entrant_1_score: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

const Event = sequelize.define('Event', {
    //TODO: singles/doubles designator [out of scope for now]
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    event_name: {
        type: DataTypes.STRING,
    },
    tourney_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Tournament',
            key: 'tourney_id'
        },
        allowNull: false
    },
    event_start_time: {
        type: DataTypes.DATE,
    },
    event_entrants: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

// Standings type
const Standings = sequelize.define('Standings', {
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    tournament_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Tournament',
            key: 'tourney_id'
        }
    },
    placements: {
        type: DataTypes.JSON
    }
}, {
    sequelize,
    createdAt: false,
    updatedAt: false,
    freezeTableName: true
});

export {sequelize, Player, Set, Tournament, Event, Standings};