const express = require('express');
const fs = require('fs').promises; 

const db = require('./db'); 

const utils = require('./utils');
const validation = require('./validation');
const admin = require('./admin'); 

const router = express.Router(); 


/* 
    Endpoint to create a video
    Request parameters:
        token: String
        moduleId: String
        name: String
        description: String
        url: String
*/
router.put('/createVideo', async (req, res) => {
    const { name, description, moduleId, vid } = req.body; 
    const timestamp = utils.timestamp(); 
    const videoId = utils.URLSafe(utils.hash(name + timestamp.toString())); 
    

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
    if (course === undefined) {
        res.status(400).json({
            mesage: 'Module does not exist. '
        });
        return;
    }
    if (course.instructor !== username ) {
        res.status(403).json({
            message: 'You have to be the instructor of the course to perform this action. '
        }); 
    }

    await db.createVideo(videoId, name, description, vid, timestamp, moduleId); 

    res.json({
        message: 'Success'
    });
}); 


/* 
    Endpoint to edit a video
    Request parameters:
        videoId: String
        moduleId: String
        name: String
        description: String
        url: String
*/
router.post('/editVideo', async (req, res) => {

    // const name = req.name;
    // const description = req.description;
    // const videoId = req.videoId;
    // const url = req.url;
    // const moduleId = req.moduleId;
    const { name, description, id: videoId, vid } = req.body; 

    let token = req.cookies.token;
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            mesage: 'You have to sign in before you can modify course content. '
        });
        return;
    }
  
    const course = (await db.searchCourses(null, {has_content: videoId}))[0];
    if (course === undefined) {
        res.status(404).json({
            mesage: 'Video does not exist. '
        });
        return;
    }

    if (course.instructor !== username){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    await db.editVideo(videoId, name, description, vid);

    res.json({
        message: 'Success'
    });
}); 


/* 
    Endpoint to create a video
    Request parameters:
        token: String
        videoId: String
*/
router.delete('/deleteVideo', async (req, res) => {

    const { id: videoId } = req.body;

    let token = req.cookies.token;
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before you can modify course content. '
        });
        return;
    }

    let course = (await db.searchCourses(null, {has_content: videoId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Video does not exist. '
        });
        return;
    } 

    if(course.instructor !== username){
        // The user is not an instructor for this course. 
        res.status(403).json({
            message: 'You are not an instructor for this course. '
        });
        return;
    }
    await db.deleteVideo(videoId);

    res.json({
        message: 'Success'
    });
}); 

module.exports = router; 