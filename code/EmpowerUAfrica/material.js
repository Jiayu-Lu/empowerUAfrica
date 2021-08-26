const express = require('express');
const fs = require('fs').promises; 

const db = require('./db'); 

const utils = require('./utils');
const validation = require('./validation');
const admin = require('./admin'); 

const router = express.Router(); 


/* 
    Endpoint to create a reading
    Request parameters:
        token: String
        moduleId: String
        name: String
        description: String
        tag: file
*/
router.put('/createReading', async (req, res) => {

    const timestamp = utils.timestamp(); 
    const { name, description, moduleId } = req.query; 
    const readingId = utils.URLSafe(utils.hash(name + timestamp.toString())); 


    if (!req.files || Object.keys(req.files).length === 0) {
        // No file was given in the request
        res.status(400).json({
            message: 'No file found in the request body. '
        });
        return; 
    }

    let token = req.cookies.token;
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            mesage: 'You have to sign in before you can modify course content. '
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_module: moduleId}))[0]; 
    if(course === undefined){
        res.status(400).json({
            mesage: 'Module does not exist. '
        });
        return;
    }
    if(course.instructor !== username){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    let newReading = req.files[Object.keys(req.files)[0]]; 
    let extension = utils.getFileExtension(newReading.name); 
    let path = `client/public/learning/${course.name}/${readingId}${extension}`;
    try {
        await newReading.mv(path); 
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            await fs.mkdir(`client/public/learning/${course.name}`);
            await newReading.mv(path); 
        }
        else {
            console.error(err); 
            res.status(500).json({
            message: 'Error when moving the file onto server. '});
            return;
        }
        
    }
    let publicPath = `/learning/${course.name}/${readingId}${extension}`
    await db.createReading(readingId, name, description, publicPath, timestamp) ;
    await db.addContentIntoModule('reading', readingId, moduleId);
    res.json({
        message: 'Success'
    });
}); 


/* 
    Endpoint to edit a reading
    Request parameters:
        token: String
        moduleId: String
        readingId: String
        name: String
        description: String
*/
router.post('/editReading', async (req, res) => {

    const { name, description, id: readingId } = req.body; 

    let token = req.cookies.token;
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            mesage: 'You have to sign in before you can modify course content. '
        });
        return;
    }
    
    const course = (await db.searchCourses(null, {has_content: readingId}))[0];
    if ( course === undefined ){
        res.status(404).json({
            mesage: 'Reading does not exist. '
        });
        return;
    }

    if ( course.instructor !== username ){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    await db.editReading(readingId, name, description);
    res.json({
        message: 'Success'
    });
}); 


/* 
    Endpoint to delete a reading
    Request parameters:
        token: String
        moduleId: String
        readingId: String

*/
router.delete('/deleteReading', async (req, res) => {
    const { id: readingId } = req.body;

    let token = req.cookies.token;
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before you can modify course content. '
        });
        return;
    }

    let promises = [db.searchReadingById(readingId), db.searchCourses(null, {has_content: readingId})];
    let [reading, courses] = await Promise.all(promises); 
    let course = courses[0]; 

    // If such course does not exist, db.searchCourses should return empty Array. 
    // If such reading does not exist, db.searchReadingById should return null. 
    if (reading === null || course === undefined) {
        res.status(404).json({
            message: 'Reading does not exist. '
        });
        return;
    }
    

    if (course.instructor !== username){
        // The user is not an instructor for this course. 
        res.status(403).json({
            message: 'You are not an instructor for this course. '
        });
        return;
    }

    promises = [db.deleteReading(readingId), fs.unlink(`client/public${reading.path}`)]; 
    try {
        await Promise.all(promises); 
    }
    catch (err) {
        console.error(err);
    }

    res.json({
        message: 'Success'
    });
}); 

module.exports = router; 