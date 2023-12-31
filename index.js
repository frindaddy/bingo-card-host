const express = require('express');
const path = require("path");

const app = express();

const port = process.env.PORT || 5000;

const router = express.Router();

router.get('/bingo_card/:name', (req, res, next) => {
    if(req.params.name){
        //Search DB where name
        res.json({result: 'Request for '+req.params.name+' received.'})
    } else {
        res.sendStatus(400);
    }
});

router.post('/update_card/:name', (req, res, next) => {
    if (req.params.name && req.body) {
        res.json({result: 'working!'})
    } else {
        res.sendStatus(400);
    }
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));

app.use('/api', router);

app.use((err, req, res, next) => {
    console.log(err);
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});