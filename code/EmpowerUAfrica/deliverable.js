const express = require('express'); 
const fs = require('fs').promises; 
const db = require('./db'); 
const utils = require('./utils');
const validation = require('./validation');
const admin = require('./admin'); 

const router = express.Router(); 


/* 
    Endpoint for when the user wants to create an deliverable
    Request parameters:
        name: String
        description: String
        total_points: String
        moduleId: String
        dueDate: int
*/
router.put('/createDeliverable', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let moduleId = req.body.moduleId;
    let totalPoints = parseFloat(req.body.totalPoints); 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a deliverable. '
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

    const name = req.body.name;
    const description  = req.body.description; 
    const timestamp = utils.timestamp(); 
    const deliverableId = 'D' + utils.URLSafe(utils.hash(name + timestamp.toString())); 


    const dueTimestamp = parseInt(req.body.dueTimestamp);

    let errCode = 0;

    if(timestamp - dueTimestamp >= 0 && dueTimestamp > 0){
        res.status(400).json({
            message: 'Your due date is in the past!'
        });
    }

    if ((errCode = validation.validateDeliverableName(name)) !== 0
        || (errCode = validation.validateDeliverableDesc(description)) !== 0) {
        res.status(400).json({
            message: validation.errMsgs[errCode]
        }); 
        return; 
    }

    await db.createDeliverable(deliverableId, name, description, totalPoints, timestamp, dueTimestamp, moduleId); 
    await db.addContentIntoModule("deliverable", deliverableId, moduleId);
    res.json({
        message: 'Success'
    });
}); 

/* 
    Endpoint for when the user wants to create a submission
    Endpoint for when the user wants to create an deliverable
    URL parameters:
        deliverableId: String
*/
router.get('/getDeliverable', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 

    const { id: deliverableId } = req.query;
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'Please sign in first. '
        });
        return;
    }

    let course = (await db.searchCourses(username, {has_content: deliverableId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Course does not exist. '
        });
        return;
    } 

    if(course.enrolled !== true){
        // The user is not an instructor for this course. 
        res.status(403).json({
            message: 'You are not enrolled in this course. '
        });
        return;
    }

    let deliverable = await db.searchDeliverableById(deliverableId);

    if(deliverable === null){
        res.status(400).json({
            message: 'Deliverable not found. '
        });
        return;
    }

    res.status(200).json(deliverable);
}); 


/* 
    Endpoint for when the user wants to create an deliverable
    Request parameters:
        deliverableId: String
        name: String
        description: String
        totalPoints: String
        dueTimestamp: int
        moduleId: String

*/
router.post('/editDeliverable', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    const { id: deliverableId, name, dueTimestamp, totalPoints, description } = req.body;



    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }


    const course = (await db.searchCourses(null, {has_content: deliverableId}))[0];
    if (course === undefined) {
        res.status(404).json({
            message: 'Deliverable not found'
        });
    }

    if (course.instructor !== username) {

        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    const timestamp = utils.timestamp(); 

    await Promise.all([
        db.editDeliverable(deliverableId, name, totalPoints, description),
        db.setDeliverableDue(deliverableId, dueTimestamp)
    ]);

    res.json({
        message: 'Success'
    });

}); 


/* 
    Endpoint for when the user wants to create an deliverable
    Request parameters:
        deliverableId: String
*/
router.delete('/deleteDeliverable', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 

    const { id: deliverableId } = req.body;
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before you can modify course content. '
        });
        return;
    }

    let course = (await db.searchCourses(null, {has_content: deliverableId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Deliverable does not exist. '
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

    await db.deleteDeliverable(deliverableId);

    res.json({
        message: 'Success'
    });
}); 


/* 
    Endpoint for when the user wants to create an deliverable
    Request parameters:
        deliverableId: String
*/
router.get('/getDeliverable', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 

    const { id: deliverableId } = req.body;
    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before you can modify course content. '
        });
        return;
    }

    let course = (await db.searchCourses(null, {has_content: deliverableId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Course does not exist. '
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

    let deliverable = await db.searchDeliverableById(deliverableId);

    if(deliverable === null){
        res.status(400).json({
            message: 'Deliverable not found. '
        });
        return;
    }

    res.status(200).json({ deliverable: deliverable });
}); 


/* 
    Endpoint for when the user wants to upload a submission
    Request parameters:
        deliverableId: String
        content: String
        media: path
        
*/
router.post('/createSubmission', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { deliverableId, content } = req.query; 
    content = content || ""; 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a submission. '
        });
        return;
    }

    const course = (await db.searchCourses(username, {has_content: deliverableId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Deliverable does not exist. '
        });
        return;
    } 
    if(!course.enrolled){
        // The user is not an enrolled in this course. 
        res.status(403).json({
            mesage: 'You are not an enrolled in this course. '
        });
        return;
    }

    let submissionFile;
    const timestamp = utils.timestamp(); 
    const submissionId = utils.URLSafe(utils.hash(username + timestamp.toString())); 
    let publicPath = ""; 
    if (req.files && Object.keys(req.files).length !== 0) {
        submissionFile = req.files[Object.keys(req.files)[0]]; 
        let extensionNames = ['pdf', 'txt'];
        let extension = submissionFile.name.slice(-3); 
        if (extensionNames.indexOf(extension) === -1) {
            res.status(400).json({
                message: `Only accepted format are ${extensionNames.join(', ')}`
            }); 
            return; 
        }
        let path = `client/public/learning/${course.name}/${deliverableId}/${submissionId}.${extension}`;
        try {
            await submissionFile.mv(path); 
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                await fs.mkdir(`client/public/learning/${course.name}/${deliverableId}`);
                await submissionFile.mv(path); 
            }
            else {
                console.error(err); 
                res.status(500).json({
                message: 'Error when moving the file onto server. '});
                return;
            }
        }
        publicPath = `/learning/${course.name}/${deliverableId}/${submissionId}.${extension}`; 
    }

    await db.createSubmission(username, deliverableId, submissionId, content, publicPath, timestamp); 
    res.json({
        message: 'Success'
    });
}); 



/* 
    Endpoint for when the user wants to get feedback for a submission
    Request parameters:
        submissionId: String
*/
router.get('/getFeedback', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let submissionId = req.body.submissionId;
  

    const course = (await db.searchCourses(null, {has_submission: submissionId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Submission does not exist. '
        });
        return;
    } 
    const isEnrolled = await db.checkEnrollment(username, course.name);
    if(!isEnrolled){
        // The user is not an enrolled in this course. 
        res.status(403).json({
            mesage: 'You are not an enrolled in this course. '
        });
        return;
    }

    const subExists = await db.checkSubmissionExist(submissionId);
    if(!subExists){
        // The user is not an enrolled in this course. 
        res.status(400).json({
            mesage: 'Submission does not exist. '
        });
    }

    let submissionGrade = await db.getSubmissionGrade(submissionId);
    let submissionComment = await db.getSubmissionComments(submissionId);

    if(submissionGrade != null){
        res.status(200).json({grade: submissionGrade, comment: submissionComment});
    }else{
        res.status(400).json({
            message: 'Submission not found.'
        });
    }
});
  
  
/* 
    Endpoint for when an instructor sends feedback
    Request parameters:
        submissionId: String
        comments: String
        grade: int
        courseName: String
*/
router.post('/sendFeedback', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let submissionId = req.body.submissionId;
    let grade = req.body.grade;
    let comment = req.body.comments;

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_submission: submissionId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Submission does not exist. '
        });
        return;
    } 
    const isInstructor = await db.checkIsInstructorFromCourse(course.name, username);
    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }


    const subExists = await db.checkSubmissionExist(submissionId);
    if(!subExists){
        // The submission does not exist. 
        res.status(400).json({
            mesage: 'Submission does not exist. '
        });
    }
    
    await db.gradeSubmission(submissionId, comment, grade);
    res.json({
        message: 'Success'
    });

});


/* 
    Endpoint for when the user wants to get feedback for a submission
    Returned object can be used for any parameter in a submission including grades
    Request parameters:
        deliverableId: String
*/
router.get('/getSubmissions', async (req, res) => {

    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let deliverableId = req.query.id;


    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(403).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_content: deliverableId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Submission does not exist. '
        });
        return;
    } 
    const isInstructor = await db.checkIsInstructorFromCourse(course.name, username);
    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    let deliverable = await db.searchDeliverableById(deliverableId);
    if(deliverable === null){
        res.status(404).json({
            mesage: 'Deliverable does not exist. '
        });
        return;
    }

    let late = await db.getLateSubmission(deliverableId);
    let onTime = await db.getInTimeSubmission(deliverableId);

    let lateSubmissionSet = await db.getAllSubmission(late);
    let onTimeSubmissionSet = await db.getAllSubmission(onTime);

    res.status(200).json({onTime: onTimeSubmissionSet, late: lateSubmissionSet});

});



/* 
    Endpoint for when the user wants to get feedback for a submission
    Request parameters:
        submissionId: String
*/
router.get('/getSubmission', async (req, res) => {

    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let submissionId = req.body.submissionId;


    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }

    const course = (await db.searchCourses(null, {has_submission: submissionId}))[0];
    // If such course does not exist, db.searchCourses should return empty Array. 
    if (course === undefined) {
        res.status(404).json({
            message: 'Submission does not exist. '
        });
        return;
    } 

    const isInstructor = await db.checkIsInstructorFromCourse(course.name, username);
    if(!isInstructor){
        // The user is not an instructor for this course. 
        res.status(403).json({
            mesage: 'You are not an instructor for this course. '
        });
        return;
    }

    let submissionExist = await db.checkSubmissionExist(submissionId);
    if(!submissionExist){
        res.status(404).json({
            mesage: 'Submission does not exist. '
        });
        return;
    }

    let submission = await db.searchSubmissionById(submissionId);
    res.status(200).json({submission});
});

router.get('/allSubmissionsOfDeliverableByUser', async (req, res) => {
    let token = req.cookies.token; 
    let username = token === undefined? null: await db.getUsernameByToken(token); 
    let { deliverableId, targetUsername } = req.query; 

    if (username === null) {
        // The user havn't logged in, or the token has expired. 
        res.status(401).json({
            message: 'You have to sign in before making a deliverable. '
        });
        return;
    }

    const course = (await db.searchCourses(username, {has_content: deliverableId}))[0]; 
    if (course === undefined) {
        res.status(404).json({
            message: 'Deliverable not found. '
        }); 
        return; 
    }
    const instructor = course.instructor; 
    if ( (username !== targetUsername || !course.enrolled ) && instructor !== username ) {
        res.status(403).json({
            message: 'You have to be the student you are searching for or the course instructor to access this information. '
        });
        return; 
    }
    const submissions = await db.getAllSubmissionsOfDeliverableByUser(deliverableId, targetUsername); 
    res.json(submissions); 
}); 

module.exports = router;