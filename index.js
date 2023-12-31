const express = require('express');
const path = require("path");
const sqlite3 = require("sqlite3");
const router = express.Router();
const app = express();

const port = process.env.PORT || 5000;

const db = new sqlite3.Database('./bingo_card_db.sqlite');

try{
    //db.run(`CREATE TABLE cards (name varchar(255), card int);`);
    db.run(`INSERT INTO cards (name, card) VALUES ('trevor', 0);`);
} catch {
    console.log('Table Already Exists')
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));

router.get('/bingo_card/:name', (req, res, next) => {
    if(req.params.name){
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
    if (req.params.name && req.body) {
        db.run(`UPDATE cards SET card = ? WHERE name = ?`,[req.body.card, req.params.name]);
        res.json({result: 'working!'})
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