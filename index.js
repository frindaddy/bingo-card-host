const express = require('express');
const path = require("path");
const {JsonDB, Config} = require("node-json-db");
const router = express.Router();
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

const JSON_DIR = process.env.JSON_DIR || './client/src/cards/';

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

let validDBs = []
let players = {}

const db2024 = new JsonDB(new Config(JSON_DIR+"2024", true, true, '/'));
const db2025 = new JsonDB(new Config(JSON_DIR+"2025", true, true, '/'));

validateDB('2024');
validateDB('2025');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));

function getJsonDB(year) {
    if(year === '2025'){
        return db2025
    } else {
        return db2024
    }
}

function validateDB(year){
    getJsonDB(year).getData('/').then(data => {
        let name_list = Object.keys(data)
        if(name_list.length > 0){
            let player_list = []
            name_list.forEach(name =>{
                if(data[name].displayName){
                    player_list.push([name, data[name].displayName])
                } else {
                    player_list.push([name, name])
                }
            })
            players[year] = player_list
            validDBs.push(year)
        }
    })
}

router.get('/bingo_card/players/:year',  (req, res, next) => {
    res.json({players: players[req.params.year]});
});

router.get('/bingo_card/:year_name',  (req, res, next) => {
    if(req.params.year_name && req.params.year_name.length > 4){
        let year = req.params.year_name.substring(0, 4)
        let name = req.params.year_name.substring(4)

        if(validDBs.includes(year)){
            getJsonDB(year).getData("/"+name).then((card) => {
                res.json(card)
            });
        } else {
            res.sendStatus(400);
        }

    } else {
        res.sendStatus(400);
    }
});

router.post('/update_card/:year', (req, res, next) => {
    if (req.params.year && req.body && validDBs.includes(req.params.year)) {
        getJsonDB(req.params.year).push('/' + req.body.name + '/selectedTiles', req.body.selectedTiles).then(r => res.sendStatus(200));
    } else {
        res.sendStatus(400);
    }
});

router.post('/discord_bot', (req, res, next) => {
    if((DISCORD_WEBHOOK !== undefined) && req.body){
        const data = typeof req.body.payload === 'string' ? { content: req.body.payload } : req.body.payload;
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if(!response.ok) {
                console.log("Error sending Discord message: "+response)
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
            }
        })
        .catch((error) => {
            console.log(error)
            res.sendStatus(500);
        });
    } else {
        console.log("Discord message not posted because there is no provided Discord token.")
        res.sendStatus(501)
    }
});

app.use('/api', router);

app.use((err, req, res, next) => {
    console.log(err);
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});