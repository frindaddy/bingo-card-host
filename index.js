const express = require('express');
const path = require("path");
const {JsonDB, Config} = require("node-json-db");
const router = express.Router();
const app = express();
const fs = require('fs');
require('dotenv').config();

const port = process.env.PORT || 5000;

const JSON_DIR = process.env.JSON_DIR || './client/src/cards/';

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

const currentDate = new Date();

let validDBs = [];
let players = {};

const cardDBs = {};

try {
    const filenames = fs.readdirSync(JSON_DIR);
    filenames.forEach(file => {
        if (path.extname(file) !== '.json') {
            console.log(`Skipping non-JSON file: ${file}`);
            return;
        } else {
            const year = path.basename(file, '.json');
            cardDBs[year] = new JsonDB(new Config(JSON_DIR+year, true, true, '/'));
        }
    });
} catch (e) {
    console.error("Error reading JSON directory: ", e);
}

Object.keys(cardDBs).forEach((year) => {
    try {
        validateDB(year);
    } catch (e) {
        console.error("Error validating DB for year " + year + ": ", e);
    }
});

validateBotWebhook();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));

function getJsonDB(year) {
    return cardDBs[year];
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

function validateBotWebhook() {
    if(DISCORD_WEBHOOK !== undefined){
        console.log('Webhook detected. Server will attempt to send Discord bot messages.');
    } else {
        console.log('No webhook detected. No Discord bot messages will be attempted.');
    }
}

function reqYearIsCurrentYear(req) {
    return req.params.year == currentDate.getFullYear();
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

router.get('/currentServerDate', (req, res, next) => {
    checkCardExistsForYear(currentDate.getFullYear()).then(()=>{
        res.json({currentServerYear: currentDate.getFullYear(),
            currentServerMonth: currentDate.getMonth(),
            currentServerDay: currentDate.getDate()
        });
    });
});

function checkCardExistsForYear(year) {
    return new Promise(async (resolve, reject) => {
        if (!validDBs.includes(year + '')) {
            try {
                const templateCard = {
                    "person1": {
                        "displayName": "It's a New Year!",
                        "selectedTiles": 0,
                        "freespace": "Send your cards to the server admin for upload!",
                        "squares": [
                            "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
                        ]
                    }
                };
                try {
                    await fs.writeFileSync(JSON_DIR + year + '.json', JSON.stringify(templateCard, null, 4));
                    resolve();
                } catch (e) {
                    console.error("Error creating new card " + year + ".json: ", e);
                    reject();
                }
                let newCard = new JsonDB(new Config(JSON_DIR + year, true, true, '/'));
                validateDB(year + '');
                cardDBs[year] = newCard;
                validDBs.push(year);
            } catch (e) {
                console.error("Error creating DB for year " + year + ": ", e);
                reject();
            }
        } else {
            resolve();
        }
    })
}

router.get('/availableCardYears', (req, res, next) => {
    res.json({years: validDBs.sort()});
});

router.post('/update_card/:year', (req, res, next) => {
    if(validUpdateRequest(req) && reqYearIsCurrentYear(req)){
        //Update card function if discord is enabled. Timing on calls is important.
        if(DISCORD_WEBHOOK !== undefined) {
            getJsonDB(req.params.year).getData('/' + req.body.name + '/selectedTiles').then((oldSelectedTiles) => {
                let newSelectedTiles = req.body.selectedTiles
                if(oldSelectedTiles < newSelectedTiles){
                    messageBot(req.params.year, req.body.name, oldSelectedTiles, newSelectedTiles);
                }
                getJsonDB(req.params.year).push('/' + req.body.name + '/selectedTiles', newSelectedTiles).then(r => res.sendStatus(200));
            });
        } else {
            //Regular update call if there is no discord bot
            getJsonDB(req.params.year).push('/' + req.body.name + '/selectedTiles', req.body.selectedTiles).then(r => res.sendStatus(200));
        }
    } else if(validUpdateRequest(req) && !reqYearIsCurrentYear(req)) {
        res.sendStatus(403);
    } else {
        res.sendStatus(400);
    }
});

function validUpdateRequest(req) {
    let isYearValid = req.params.year && req.body && validDBs.includes(req.params.year);
    let doesPlayerExist = players[req.params.year].map(player =>  {return player[0]}).includes(req.body.name);
    return isYearValid && doesPlayerExist;
}

function messageBot(year, name, oldSelectedTiles, newSelectedTiles){
    getJsonDB(year).getData('/'+ name).then((playerCard) => {
        let toggledSquareIndex = Math.log2(oldSelectedTiles ^ newSelectedTiles);
        sendDiscordMessage(getTileText(playerCard, toggledSquareIndex), playerCard.displayName);
    });
}

function getTileText(card, tileIndex){
    if(tileIndex < 12) return card.squares[tileIndex];
    if(tileIndex === 12) return card.freespace;
    if(tileIndex > 12) return card.squares[tileIndex-1];
}

function sendDiscordMessage(markedTileText, displayName){
    if(DISCORD_WEBHOOK !== undefined){
        const message = "# 🚨 BINGO ALERT 🚨\n\n"+
                    "***" + markedTileText + "*** on **" + displayName + "'s** card has been checked!\n"+
                    "-# Go to [the site](https://bingo.icebox.pw) to check it out!";
        const data = typeof message === 'string' ? { content: message } : message;
        try {
            fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        console.error("Error sending Discord message: "+response);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (e) {
            console.error('Webhook failed. Check that API key is valid and Discord is up!');
        }
    }
}

app.use('/api', router);

app.use((err, req, res, next) => {
    console.log(err);
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
