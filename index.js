const express = require('express');
const path = require("path");
const sqlite3 = require("sqlite3");
const router = express.Router();
const app = express();

const port = process.env.PORT || 5000;

const db = new sqlite3.Database('./db/bingo_card_db.sqlite');

let db_status = false;

db.get(`SELECT * FROM sqlite_master WHERE name = 'cards'`, (err, row) => {
    if (err) {
        console.log('ERROR')
        throw err;
    }
    if (row) {
        console.log('Table Exists! Starting Bingo!')
        db_status = true;
    } else {
        console.log('Table does not exist. Creating table...')
        db.run(`CREATE TABLE cards (name varchar(255), card int);`, () => {
            db.run(`INSERT INTO cards (name, card) VALUES ('andrew', 0), ('austin', 0), ('brent', 0), ('jacob', 0), ('sasha', 0), ('tim', 0), ('trevor', 0), ('will', 0);`, () => {
                console.log('Table created and players added!');
                db_status = true;
            });
        });

    }
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));

router.get('/bingo_card/:name', (req, res, next) => {
    if(req.params.name && db_status){
        db.get(`SELECT * FROM cards WHERE name = ?`, req.params.name, (err, row) => {
            if (err) {
                console.log('ERROR')
                throw err;
            }
            if (row) {
                res.json(row)
            } else {
                res.sendStatus(404);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

router.post('/update_card/:name', (req, res, next) => {
    if (req.params.name && req.body && db_status) {
        db.run(`UPDATE cards SET card = ? WHERE name = ?`,[req.body.card, req.params.name], () => {
            res.sendStatus(200);
        });
    } else {
        res.sendStatus(400);
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