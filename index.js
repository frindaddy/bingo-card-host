const express = require('express');
const path = require("path");
const {JsonDB, Config} = require("node-json-db");
const router = express.Router();
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

const JSON_DIR = process.env.JSON_DIR || './client/src/cards/';

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
let warnNoDiscordWebhook = true;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const RECIPIENT_PHONE_NUMBERS = process.env.RECIPIENT_PHONE_NUMBERS;
let warnNoSMS = true;

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
        if(players[req.params.year].map(player =>  {return player[0]}).includes(req.body.name)){
            getJsonDB(req.params.year).getData('/' + req.body.name + '/selectedTiles').then((oldSelectedTiles) => {
                if(oldSelectedTiles < (newSelectedTiles = req.body.selectedTiles)){
                    messageBot(req.params.year, req.body.name, oldSelectedTiles, newSelectedTiles);
                }
            });
            getJsonDB(req.params.year).push('/' + req.body.name + '/selectedTiles', req.body.selectedTiles).then(r => res.sendStatus(200));
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(400);
    }
});

function messageBot(year, name, oldSelectedTiles, newSelectedTiles){
    getJsonDB(year).getData('/'+ name +'/displayName').then((displayName) => {
        getJsonDB(year).getData('/' + name + getTileTextPath(Math.log2(oldSelectedTiles ^ newSelectedTiles))).then((markedTileText) => {
            sendDiscordMessage(markedTileText, displayName);
            sendSMS(markedTileText, displayName);
        });
    });
}

function getTileTextPath(tileIndex){
    if(tileIndex < 12) return ("/squares["+tileIndex+"]");
    if(tileIndex === 12) return "/freespace";
    if(tileIndex > 12) return ("/squares["+(tileIndex-1)+"]");
}

function sendDiscordMessage(markedTileText, displayName){
    if(DISCORD_WEBHOOK !== undefined){
        message = "# 🚨 BINGO ALERT 🚨\n\n"+
                    "***" + markedTileText + "*** on **" + displayName + "'s** square has been checked!\n"+
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
                        console.log("Error sending Discord message: "+response);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (e) {
            console.error('Fetch failed. Check that API key is valid and discord is up!');
        }
    } else {
        if(tryDiscordPost){
            console.log("Discord message not posted because there is no provided Discord webhook.");
            warnNoDiscordWebhook = false;
        }
    }
}

function sendSMS(markedTileText, displayName){
    if((TWILIO_ACCOUNT_SID !== undefined) && (TWILIO_AUTH_TOKEN !== undefined)){
        message = "🚨 BINGO ALERT 🚨\n\n"+
                    markedTileText + " on " + displayName + "'s card has been checked!\n\n"+
                    "Go to https://bingo.icebox.pw to check it out!";
        const smsClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        smsClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: RECIPIENT_PHONE_NUMBERS
        }).then(message => console.log(message.sid));
    } else {
        if(warnNoSMS){
            console.log("SMS not sent because there is no provided Twilio SID or Auth Token.");
            warnNoSMS = false;
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
