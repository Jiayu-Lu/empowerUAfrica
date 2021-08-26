const crypto = require('crypto'); 

let Utils = {
    /*
        obj: object
        fields: Array of String
        if obj has all properties listed in fields, return true, else return false. 
    */
    objHasFields: (obj, fields) => {
        for (let field of fields) {
            if (!(field in obj)) {
                return false; 
            }
        }
        return true; 
    },

    /*
        params: 
            - username: String, the username to be checked.
        returns:
            - true, if the username is valid. 
            - false o\w. 
    */
    isValidUsername: (username) => {
        if (username.indexOf('@') !== -1) {
            return false;
        }
    }, 

    hash: (str) => {
        const sha256 = crypto.createHash('sha256');
        const hash = sha256.update(str).digest('base64');
        return hash;
    },

    getToken: () => {
        return crypto.randomBytes(30).toString('hex');
    },
        
    /*
        Returns number of seconds from 1970-1-1 00:00 until now
    */
    timestamp: () => {
        return Math.round(Date.now() / 1000);
    },
    /*
        params:
            - id: String, either an id for a post or a comment
    */
    typeOfId: (id) => {
        switch (id[0]) {
            case 'P': return 'post';
            case 'C': return 'reply'; 
            default: 
                return null;
        }
    },
    /*
        params: 
            - str: String, the string to be cleaned. 
        returns
            str after replacing all URL unsafe characters. 
    */
    URLSafe: (str) => {
        let safeStr = '';
        const URLSafeChars = ['-', '_', '~'];
        for (const char of str) {
            if (!(char >= 'a' && char <= 'z') && 
                !(char >= 'A' && char <= 'Z') && 
                !(char >= '0' && char <= '9') && 
                (URLSafeChars.indexOf(char) === -1)) {
                
                safeStr += (char.charCodeAt(0) % 10).toString(); 
            }
            else {
                safeStr += char; 
            }
        }
        return safeStr; 
    },
    /**
     * 
     * @param {*} filename 
     * @returns the file extension in the filename
     * example: (a.txt) -> .txt
     */
    getFileExtension: (filename) => {
        let seperated = filename.split('.'); 
        if (seperated.length === 1) {
            return ''
        }
        return `.${seperated[seperated.length - 1]}`; 
    }

}
module.exports = Utils; 