const express = require('express');

const fs = require('fs').promises; 

const db = require('./db'); 

const utils = require('./utils');
const validation = require('./validation');
const admin = require('./admin'); 

const router = express.Router(); 

/* 
    Endpoint to get all information of all courses
    Params: None
    
*/
router.get('/getCourses', async (req, res) => {
    let token = req.cookies.token;
    let username = token === undefined? undefined: await db.getUsernameByToken(token); 
    let searchCriteria = req.query; 

    let results = await db.searchCourses(username, searchCriteria);
    if(results != null){
        res.status(200).json(results);
    }else{
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }

});


/* 
    Endpoint for when the user wants to create a course
    Request parameters:
        courseName: String
        instructor: String
        description: String
        token: String
*/
router.put('/createCourse', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before creating a course. '
        });
        return;
    }


    if(!(await admin.isAdmin(username))){
        res.status(403).json({
            message: 'You have to be an admin to do this. '
        });
        return;
    }

    const { name, instructor, description } = req.body; 

    let courseExistPromise = db.courseExists(name);
    let instructorAbstractPromise = db.getUserAbstract(instructor); 
    const [courseExists, instructorAbstract] = await Promise.all([courseExistPromise, instructorAbstractPromise]);

    if (instructorAbstract === null){
        res.status(404).json({message: "Instructor does not exist"});
        return; 
    }
    if (courseExists) {
        res.status(409).json({
            message: 'Course with such name already exists.'
        });
        return; 
    }

    let errCode = 0; 

    if ((errCode = validation.validateCourseName(name)) !== 0
        || (errCode = validation.validateCourseDesc(description)) !== 0) {
        res.status(400).json({
            message: validation.errMsgs[errCode]
        }); 
        return; 
    }

    await db.createCourse(name, instructor, description)
    res.json({
        message: 'Success'
    });
}); 



/* 
    Endpoint for when the user wants to delete a course
    Request parameters:
        courseName: String
        token: String
*/
router.delete('/deleteCourse', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { name: courseName } = req.body; 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before deleting a course. '
        });
        return;
    }

    if(!admin.isAdmin(username)){
        res.status(403).json({
            message: 'You have to be an admin to do this. '
        });
        return;
    }

    if((await db.courseExists(courseName)) === false){
        res.status(404).json({
            message: 'Course not found'
        });
        return; 
    }

    await db.deleteCourse(courseName);

    res.json({
        message: 'success'
    });
});


/* 
    Endpoint to update course information
    Request parameters:
        token: String
        courseName: String
        newDescription: String
        newInstructor: String
*/
router.post('/updateCourse', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { name, instructor, description} = req.body; 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            mesage: 'Please sign in first.'
        });
        return;
    }

    if(!admin.isAdmin(username)){
        res.status(403).json({
            message: 'You have to be an admin to do this.'
        });
        return;
    }
    
    let promises = [db.courseExists(name)];
    // If the request specifies a new instructor, verify the new insturctor exists. 
    if (instructor !== null) {
        promises.push(
            (async () => (await db.getUserAbstract(instructor)) !== null)()
        ); 
    }
    let [courseExists, instructorExists] = await Promise.all(promises); 

    if (courseExists === false) {
        res.status(404).json({
            message: 'Course not found'
        });
        return;
    }
    if (instructorExists === false) {
        res.status(404).json({
            message: "Instructor does not exist"
        });
        return; 
    }

    // Validate new description
    let errCode;
    if ((errCode = validation.validateCourseDesc(description)) !== 0) {
        res.status(400).json({
            message: validation.errMsgs[errCode]
        }); 
        return; 
    }

    await db.editCourse(name, description, instructor);
    res.status(200).json({message: "Success"});
}); 

/* 
    Endpoint for when the user wants to create a module
    Request parameters:
        courseName: String
        moduleName: String
        token: String
*/
router.put('/createModule', async(req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    const {courseName, moduleName} = req.body; 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before making a course. '
        });
        return;
    }

    const timestamp = utils.timestamp(); 
    const moduleId = 'M' + utils.URLSafe(utils.hash(moduleName + timestamp.toString())); 
    const courseInfo = (await db.searchCourses(username, {name_equals: courseName}))[0]; 

    if (courseInfo === undefined) {
        // The course does not exist. 
        res.status(404).json({
            message: 'The course specified does not exist. '
        });
        return; 
    }
    const isInstructor = courseInfo.instructor === username; 
    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            message: 'You are not an instructor for this course. '
        });
        return; 
    }

    let errCode = 0; 

    if ((errCode = validation.validateCourseName(courseName)) !== 0
        || (errCode = validation.validateModuleName(moduleName)) !== 0) {
        res.status(400).json({
            message: validation.errMsgs[errCode]
        }); 
        return; 
    }

    await db.createModule(courseName, moduleId, moduleName, timestamp); 
    res.json({
        message: 'Success'
    });
});

/* 
    Endpoint to update module information
    Request parameters:
        token: String
        moduleId: String
        newModuleName: String
*/
router.post('/editModule', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 

    const { id: moduleId, name: moduleName} = req.body; 
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            mesage: 'You have to sign in before you edit a module.'
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_module: moduleId}))[0]; 
    if (course === undefined) {
        res.status(404).json({
            message: 'Module not found'
        });
        return; 
    }
    const isInstructor = course.instructor === username; 

    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    await db.editModule(moduleId, moduleName);
    res.status(200).json({message: "Success"});

}); 

/* 
    Endpoint for when the user wants to delete a module
    Request parameters:
        moduleId: String
        token: String
*/
router.delete('/deleteModule', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { moduleId } = req.body;

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before deleting a course. '
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_module: moduleId}))[0]; 
    if (course === undefined) {
        res.status(404).json({
            message: 'Module not found'
        });
        return; 
    }
    const isInstructor = course.instructor === username; 
    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    await db.deleteModule(moduleId);

    res.json({
        message: 'Success'
    });
});


/* 
    Endpoint for when the user wants to get content of the course
    Request parameters:
        courseName: String
        token: String
*/
router.get('/getCourseContent', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { courseName } = req.query;
    let result = {};

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before getting course content. '
        });
        return;
    }
    
    if (!(await db.courseExists(courseName))) {
        // If the course does not exist. 
        res.status(404).json({
            message: 'Course not found'
        });
        return; 
    }
    let courseContent = (await db.searchCourses(username, {name_equals: courseName}))[0]; 

    if (!(await admin.isAdmin(username))) {
        if (courseContent.instructor !== username && courseContent.enrolled !== true) {
            res.status(403).json({
                message: 'You do not have the permission to view the contents of this course. Enroll first. '
            });
            return;
        }
    }
    // If the user is an admin, skip the enrollment test. 

    result.name = courseContent.name || '';
    result.instructor = courseContent.instructor || '';
    result.description = courseContent.description || '';
    result.modules = await db.getAllModules(courseName);
    console.log(courseContent); 
    res.status(200).json(result);
});


/* 
    Endpoint for when the user wants to enroll in a course
    Request parameters:
        courseName: String
        token: String
*/
router.post('/enrollCourse', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { courseName } = req.body;

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before enrolling in course. '
        });
        return;
    }

    await db.enrollCourse(courseName, username);
    res.json({
        message: 'success'
    });

});


/* 
    Endpoint for when the user wants to drop a course
    Request parameters:
        courseName: String
*/
router.post('/dropCourse', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { courseName } = req.body;


    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before dropping course. '
        });
        return;
    }

    await db.dropCourse(courseName, username);
    res.json({
        message: 'success'
    });

});




module.exports = router; 