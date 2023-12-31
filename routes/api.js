const express = require('express');
const router = express.Router();

router.get('/bingo_card/', (req, res, next) => {
    if(req.params.name){
        //Search DB where name
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

module.exports = router;