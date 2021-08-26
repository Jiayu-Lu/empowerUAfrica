const config = require("./config")

/*
    This module is responsible for validating user inputs, 
    including email, password, username etc. 
*/


module.exports = {
    /*
        params:
            - username: String, the username to be validated. 
        returns:
            - 0 if the username is valid.
            - errCode: Number o\w, where usernameErrMsg[errCode] gives the corresponding error message.
    */
    validateUsername: (username) => {
        if (username.length > config.username.maxlen || username.length < config.username.minlen) {
            return 1; 
        }
        for (let char of username) {
            if ( 
                !(char >= 'a' && char <= 'z') && 
                !(char >= 'A' && char <= 'Z') && 
                !(char >= '0' && char <= '9') && 
                (config.username.specialChars.indexOf(char) === -1)) {
                return 2;
            }
        }

        return 0;
    },

    /*
        params:
            - email: String, the email to be validated. 
        returns:
            - 0 if the email is valid.
            - errCode: Number o\w, where emailErrMsg[errCode] gives the corresponding error message.
    */
    validateEmail: (email) => {
        // Email too long or too short
        if (email.length > config.email.maxlen || email.length < config.email.minlen) {
            return 3; 
        }
        // Email not in correct form
        if (!(config.email.regex.test(email))) {
            return 4; 
        }

        return 0; 
    },

    /*
        params:
            - password: String, the password to be validated. 
        returns:
            - 0 if the password is valid.
            - errCode: Number o\w, where passwordErrMsg[errCode] gives the corresponding error message.
    */
    validatePassword: (password) => {
        // Password too long or too short. 
        if (password.length > config.password.maxlen || password.length < config.password.minlen) {
            return 5; 
        }

        return 0; 
    },
    validatePostTitle: (title) => {
        if (title.length < config.postTitle.minlen || title.length > config.postTitle.maxlen) {
            return 6;
        }
        return 0;
    },
    validatePostBody: (body) => {
        if (body.length < config.postBody.minlen || body.length > config.postBody.maxlen) {
            return 7;
        }
        return 0;
    },
    validateDeliverableName: (title) => {
        if (title.length < config.deliverableName.minlen || title.length > config.deliverableName.maxlen) {
            return 8;
        }
        return 0;
    },
    validateDeliverableDesc: (body) => {
        if (body.length < config.deliverableDesc.minlen || body.length > config.deliverableDesc.maxlen) {
            return 9;
        }
        return 0;
    },    
    validateCourseName: (title) => {
        if (title.length < config.courseName.minlen || title.length > config.courseName.maxlen) {
            return 10;
        }
        return 0;
    },
    validateCourseDesc: (body) => {
        if (body.length < config.courseDesc.minlen || body.length > config.courseDesc.maxlen) {
            return 11;
        }
        return 0;
    },
    validateModuleName: (title) => {
        if (title.length < config.moduleName.minlen || title.length > config.moduleName.maxlen) {
            return 12;
        }
        return 0;
    },
    errMsgs : [
        '',
        `Username should be between ${config.username.minlen} and ${config.username.maxlen} characters.`,
        `Username can only contain a-z, A-Z, 0-9 and special characters ${config.username.specialChars.join(', ')}`,
        `Emails should be between ${config.email.minlen} and ${config.email.maxlen} characters.`,
        'Email not in correct format. Valid email example: example@site.com',
        `Passwords should be between ${config.password.minlen} and ${config.password.maxlen} characters.`,
        `Post title should be between ${config.postTitle.minlen} and ${config.postTitle.maxlen} characters.`,
        `Post body should be between ${config.postBody.minlen} and ${config.postBody.maxlen} characters.`,
        `Deliverable name should be between ${config.deliverableName.minlen} and ${config.deliverableName.maxlen} characters.`,
        `Deliverable description should be between ${config.deliverableDesc.minlen} and ${config.deliverableDesc.maxlen} characters.`,
        `Course name should be between ${config.courseName.minlen} and ${config.courseName.maxlen} characters.`,
        `Course description should be between ${config.courseDesc.minlen} and ${config.courseDesc.maxlen} characters.`,
        `Module name should be between ${config.moduleName.minlen} and ${config.moduleName.maxlen} characters`
    ]
}