const express = require('express'); 

const db = require('./db'); 
const utils = require('./utils');
const validation = require('./validation');
const admin = require('./admin'); 

const router = express.Router(); 

/* 
    Endpoint for when the user wants to get all important dates
    Request parameters:
        Token: String
*/
router.get('/getImportantDates', async (req, res) => {

    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 


    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }
    
    let deliverables = await db.getUserDeliverables(username);
    let dates = {dates: []};

    for (let i = 0; i < deliverables.length; i++) {
        const event = {
            title: deliverables[i].title,
            dateTimestamp: deliverables[i].due.low || deliverables[i].due
        }
        dates.dates.push(event); 
    }

    res.status(200).json(dates);
});

module.exports = router;