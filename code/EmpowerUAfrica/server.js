'use strict'; 
const Express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const Utils = require('./utils');
const accountRouter = require('./account');
const profileRouter = require('./profile');
const communityRouter = require('./community');
const learningRouter = require('./learning');
const mediaRouter = require('./media'); 
const deliverableRouter = require('./deliverable'); 
const materialRouter = require('./material'); 
const calendarRouter = require('./calendar');

const PORT = 5000; 

const app = Express(); 

/*
    '/api/signup': ['email', 'password'] means that
    route '/api/signup' is expecting the request body(or url if the request is a GET request) to have fields
    'email' and 'password'. 

    If a route is not present here, it means the route does not specify
    which fields are expected. 
*/
const expectedFields = {
    '/api/account/signup': ['username', 'email', 'password', 'type'], 
    '/api/account/signin': ['id', 'password'],
    '/api/account/updateCredentials': ['type', 'new'],
    '/api/profile/getProfile': ['username'], 
    '/api/profile/getProfilePic': ['username'],
    '/api/profile/updateProfile': ['updates'],
    '/api/community/createPost': ['title', 'body'],
    '/api/community/createComment': ['reply_to', 'body'],
    '/api/community/followPost': ['id', 'follow'],
    '/api/community/deleteContent': ['id'],
    '/api/proifle/getUsersAbstract': ['username'],
    '/api/community/getPosts': ['post_per_page', 'page_number'],
    '/api/learning/createCourse': ['name', 'instructor', 'description'],
    '/api/learning/updateCourse': ['name'],
    '/api/learning/searchCourse': ['name'],
    '/api/learning/deleteCourse': ['name'],
    '/api/learning/editModule': ['id', 'name'],
    '/api/learning/deleteVideo': ['id'],
    '/api/learning/editVideo': ['name', 'description', 'id', 'vid'],
    '/api/learning/editReading': ['name', 'description', 'id']
};

// parse the request body as json. 
app.use(Express.json());
app.use(cookieParser());
app.use(fileUpload()); 

// checks whether the expected fields are present in the request body
app.use((req, res, next) => {
    console.log(`[server]: Request recieved. `);
    console.log(`${req.method} ${req.path}`);
    req.method === 'GET'? 
        console.log(req.query):
        console.log(req.body);
    // If the required field is not specified
    if (!(req.path in expectedFields)) {
        next();
        return;
    }

    if ((req.method === 'GET' && !Utils.objHasFields(req.query, expectedFields[req.path]))||
        (req.method !== 'GET' && !Utils.objHasFields(req.body, expectedFields[req.path]))) {
        res.status(400).json(
            {"message": `Bad request: expecting fields [${expectedFields[req.path].join(', ')}] in request body / url params.`}
        );
        return;
    }
    next();
}); 

app.use((req, res, next) => {
    
    next(); 
})

app.get("/", (req, res) => {
    res.send('Hello World!');
});

app.use('/api/account', accountRouter); 
app.use('/api/profile', profileRouter); 
app.use('/api/community', communityRouter); 
app.use('/api/learning', learningRouter); 
app.use('/api/learning', mediaRouter); 
app.use('/api/learning', deliverableRouter); 
app.use('/api/learning', materialRouter); 
app.use('/api/deliverable', deliverableRouter);
app.use('/api/calendar', calendarRouter);

app.listen(PORT, () => console.log(`[server]: Server started on port ${PORT}`)); 