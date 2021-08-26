const neo4j = require('neo4j-driver'); 
const utils = require('./utils'); 
const init = require('./db-init'); 
const config = require('./config');

let MySQLConnection;
let Neo4jDriver; 

let mySQLProfileFields; 

/*
    When executed, removes all rows in Tokens table that are expired. 
*/
const removeExpiredTokens = async () => {
    await MySQLConnection.execute("DELETE FROM Tokens WHERE expiration_time < NOW(); "); 
}

(async () => {
    let connections = await init(); 
    MySQLConnection = connections.MySQL; 
    Neo4jDriver = connections.Neo4j; 

    let res = await MySQLConnection.execute('SHOW columns FROM `Profile`');
    mySQLProfileFields = res[0].map(row => row.Field); 
    
    setInterval(removeExpiredTokens, 60 * 1000 * config.tokens.cleanExpiredTokenInterval); 
})();

const db = {
/*=======================These method are for MySQL=========================== */
    /**
     * Create a new row for a new user in Accounts database
     * @param {*} username String
     * @param {*} email String 
     * @param {*} password String
     * @param {*} type String
     */
    createNewAccount: async (username, email, password, type) => {
        let sql = 'INSERT INTO Accounts(username, email, password, type)\
        VALUES(?, ?, ?, ?);'; 
        let data = [username, email, password, type]; 
        await MySQLConnection.execute(sql, data); 
    }, 


    /**
     * Check if the password that user input is right
     * @param {*} idtype "username" or "email", indicates the type of id.
     * @param {*} id String, could be an email or a username, depends on idtype. 
     * @param {*} password String
     * @returns True, if the credentials match.
     *          False o\w.
     *          Null, if the username does not exist
     */
    credentialsMatch: async (idtype, id, password) => {
        let sql = `SELECT password FROM Accounts WHERE ${idtype} = ?`; 
        let data = [id]; 
        let response = await MySQLConnection.execute(sql, data);

        if (response[0].length === 0) {
            return null;
        }
        let actualPasswd = response[0][0].password; 
        return actualPasswd === password; 
    },

    /**
     * Return the username with the given email
     * @param {*} email String, the email to be searched for
     * @returns the username of user with email = email, if the user is found. 
                Null o\w 
     */
    usernameForEmail: async (email) => {
	    let sql = 'SELECT username FROM Accounts WHERE email = ?';
        let data = [email];
        let response = await MySQLConnection.execute(sql, data);

        if (response[0].length === 0) {
            return null;
        }
        else {
            return response[0][0].username; 
        }
    }, 

    /**
     * Update user’s email/password with the new one
     * @param {*} type String, either 'email' or 'password'
     * @param {*} username String, the user who requested the update
     * @param {*} newCredential String, the new email or password, depending on type
     */
    updateCredentials: async (type, username, newCredential) => {
        let sql = `UPDATE Accounts SET ${type} = ? WHERE username = ?`; 
        let data = [newCredential, username];
        await MySQLConnection.execute(sql, data);
    },

    /**
     * Create a new row for a new user in Token database
     * @param {*} token String, the user's token 
     * @param {*} username String
     */
    addToken: async (token, username) => {
        let sql = `INSERT INTO Tokens(token, username, expiration_time) \
        VALUES(?, ?, NOW() + INTERVAL ${config.tokens.tokenExpirationTime});`;
        let data = [token, username]; 
        await MySQLConnection.execute(sql, data);
    }, 
   
    /**
     * Delete user’s token in the database
     * @param {*} token String, the token to be deleted. 
     */
    delToken: async (token) => {
        let sql = 'DELETE FROM Tokens WHERE token=?'; 
        let data = [token]; 
        await MySQLConnection.execute(sql, data);
    }, 

    /**
     * Return the username with the given token
     * @param {*} token String, the token to be queried. 
     * @returns the username corresponding to the token. 
                Null if the token is not found in the database, or has expired.
     */
    getUsernameByToken: async (token) => {
        let sql = 'SELECT username FROM Tokens WHERE token = ? AND expiration_time > NOW()';
        let data = [token]; 
        let response = await MySQLConnection.execute(sql, data); 
        if (response[0].length === 0) {
            return null;
        }
        return response[0][0].username; 
    }, 

    /**
     * Create a new row for a new user in Profile database
     * @param {*} username String 
     */
    addUserProfile: async (username) => {
        let sql = "INSERT INTO Profile(username, name) VALUES(?, ?);";
        let data = [username, username];
        await MySQLConnection.execute(sql, data);
    },

    /**
     * Update user’s profile in the Profile database
     * @param {*} username String
     * @param {*} updates Object, keys are fields to be updated, values are the new value for the said field
     */
    updateProfile: async(username, updates) =>{
        let keys = Object.keys(updates);
        // Remove all keys that are not column names of the Profile table. 
        for (const key of keys) {
            if (mySQLProfileFields.indexOf(key) === -1) {
                delete updates[key];
                keys.pop(keys.indexOf(key));
            }
        }
        let sql = `UPDATE Profile SET ${keys.map(key => key + '=?').join(', ')} 
                    WHERE username=?`;
        let data = keys.map(key => updates[key]);
        data.push(username); 

        await MySQLConnection.execute(sql, data); 
    },

    /**
     * Return a JavaScript Object where each field contains user’s profile info in the database
     * @param {*} username String
     * @returns An object. Keys are each field. Values are the data in the database.
     */
    getProfileByUsername: async (username) => {
        let profile;
        let sql = `SELECT *
                   FROM Profile 
                   WHERE username=?`;
        let data = [username];
        let response = await MySQLConnection.execute(sql, data);
        if (response[0].length === 0) {
            return null;
        }

        profile = {
            name: response[0][0].name,
            gender: response[0][0].gender,
            birthdate: response[0][0].birthdate,
            phone_number: response[0][0].phone_number,
            industry: response[0][0].industry,
            pfp_type: response[0][0].pfp_type,
            description: response[0][0].description,
            website: response[0][0].website
        }
        return profile;
    },

    /**
     * Return the type of the user
     * @param {*} username String
     * @returns A string indicating user's type
     */
    getUserType: async (username) => {
        let sql = "SELECT type FROM Accounts WHERE username=?";
        let data = [username];
        let response = await MySQLConnection.execute(sql, data);
        if (response[0].length === 0) {
            return null;
        }
        return response[0][0].type; 
    },

   /**
    * Return the type and email of the user
    * @param {*} username String
    * @returns null if the username specified does not exist.
            O/w, {
                email: the user's email,
                type: (int) the user's type
            }
    */
    getUserAbstract: async (username) => {
        let sql = "SELECT type, email FROM Accounts WHERE username=?"; 
        let data = [username]; 
        let response = await MySQLConnection.execute(sql, data);
        if (response[0].length === 0) {
            return null;
        }
        return {email: response[0][0].email, type: response[0][0].type};
    },

    getUsersAbstract: async (users) => {
        let paramTemplate = [];
        for (let i = 0; i < users.length; i++) {
            paramTemplate.push('?');
        }
        paramTemplate = paramTemplate.join(', '); 
        let sql = `
            SELECT Accounts.username, Accounts.type, Profile.name, Profile.description
                ,Profile.pfp_type
            FROM Accounts
            JOIN Profile ON Accounts.username = Profile.username
            WHERE Accounts.username IN (${paramTemplate})
            GROUP BY Accounts.username`;

        let response = await MySQLConnection.execute(sql, users); 
        if (response[0].length === 0) {
            return null;
        }
        let userAbstracts = {};
        for (const user of response[0]) {
            userAbstracts[user.username] = user;
            if (user.description === null) {
                user.description = ''; 
            }
            if (user.description.length >= 50) {
                user.description = user.description.slice(0, 50) + '...';
            }
        }
        return userAbstracts; 
    
    }, 

    /*====================================================================================*/
    /*These methods are for Neo4j database*/
    /**
     * Create a user node in the database
     * @param {*} username String 
     */
    createUser: async (username) => {
        let session = Neo4jDriver.wrappedSession();
        let query = "CREATE (u:user {UserName: $username})";
        let params = {"username": username};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Create a postNode with given data and create ‘CREATE_POST’ relationship between user and post
     * @param {*} username String
     * @param {*} content String, the content of the post
     * @param {*} title String, the title of the post
     * @param {*} id the unique id of the post
     * @param {*} time the time that user makes the post
     */
    makePost: async (username, content, title, id, time) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username}) 
                    CREATE (u)-[:CREATE_POST]->(p:post {Title: $title, Content: $content, Time: $time, id: $id}) `;
        let params = {"username":username, "content": content, "title": title, "time": time, "id": id};
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },

    /**
     * Delete the post node and any relationship with this post node
     * @param {*} id id: the id of the post that user reply to
     */
    deletePost: async (id) => {
        let session = Neo4jDriver.wrappedSession();

        let query = `MATCH (p: post {id: $id})
                    OPTIONAL MATCH (r:reply)-[:REPLY_TO*0..]->(p)
                    DETACH DELETE r, p`;

        let params = {"id": id};
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },

    /**
     * Return a set of objects where each object contains id, content, title and time
     * @param {*} title String, part of the string of the title
     * @returns A set of objects where each object contains all the info of a post
     */
    searchPostByTitle: async (title) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (p:post) 
                     WHERE p.Title =~'.*$title.*'  
                     RETURN p`;
        let params = {"title": title};
        let result;
        let postSet = [];
        try {
            result = await session.run(query, params);
            let records = result.records;
            for (let i = 0; i < records.length; i++) {
                let post = records[i].get(0);
                postSet.push({
                    id: post.properties.id,
                    title: post.properties.Title,
                    time: post.properties.Time,
                    content: post.properties.Content
                })
            }
        } catch (err) {
            console.error(err);
        }
        session.close();
        return postSet;
    },

    /**
     * Return a set of objects where each object contains id, content, title and time
     * @param {*} id Part of the target id
     * @returns A set of objects where each object contains all the info of a post
     */
    searchPostById: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH 
                        (p:post), 
                        (author:user)-[:CREATE_POST]->(p)
                     WHERE p.id = $id 
                     RETURN p, author.UserName AS author`;
        let params = {id};
        let result, postContent;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        if (result.records.length === 0) {
            return null; 
        }
        postContent = result.records[0].get('p').properties; 
        postContent.author = result.records[0].get('author'); 
        session.close();
        return postContent;
    },

    /**
     * Return a set of objects where each object contains id, content, title and time. 
     * Each object will be the post that user created
     * @param {*} username String
     * @returns A set of objects where each object contains all the info of a post
     */
    searchPostByUser: async (username) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})  
                           (u)-[:CREATE_POST]->(p:post)  
                     RETURN p`;
        let params = {"username": username};
        let result;
        let postSet = [];
        try {
            result = await session.run(query, params);
            let records = result.records;
            for (let i = 0; i < records.length; i++) {
                let post = records[i].get(0);
                postSet.push({
                    id: post.properties.id,
                    title: post.properties.Title,
                    time: post.properties.Time,
                    content: post.properties.Content
                })
            }
        } catch (err) {
            console.log(err);
        }
        session.close();
        return postSet;
    },

  /**
     * Return the username of the author that makes the reply/post
     * @param {*} id String, the id of the post / reply
     * @param {*} contentType String, post | reply
     * @returns the author's username
     */
    getAuthorOfContent: async (id, contentType) => {
        const session = Neo4jDriver.wrappedSession(); 

        let query;
        let params = {id};  
        if (contentType === 'post') {
            query = `MATCH 
                        (p:post {id: $id}), 
                        (u:user)-[:CREATE_POST]->(p)
                    RETURN 
                        u.UserName AS username`;
        }
        else if (contentType === 'reply') {
            query = `MATCH 
                        (r:reply {id: $id}), 
                        (u:user)-[:CREATE_REPLY]->(r)
                    RETURN 
                        u.UserName AS username`;
        }
        else {
            return null; 
        }

        let result; 
        try {
            result = await session.run(query, params).then();
        } catch (err) {
            console.error(err);
        }
        
        if (result.records.length === 0) {
            return null;
        }
        const author = result.records[0].get('username');
        session.close();
        return author; 

    },
    getPostCount: async(criteria) => {
        const session = Neo4jDriver.wrappedSession(); 
        // TODO: make the query suitable for applying different criteria. 
        let query = `MATCH (p:post) RETURN count(p) AS post_count`; 
        const result = await session.run(query); 
        let post_count = result.records[0].get('post_count').low; 
        session.close();
        return post_count;
    }
    ,
    /**
     * Return a set of objects where each object contains id, content, title
     * and time sorted by time, and returns posts numbers
     * @param {*} pageNum Int
     * @param {*} postPerPage Int
     * @returns A set of objects in time-descending order where each object contains all the info of a post
     */
    getPosts: async(pageNum, postPerPage, criteria) => {

        let skipNum = pageNum * postPerPage;
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH 
                        (p:post),
                        (author:user)-[:CREATE_POST]->(p)
                     OPTIONAL MATCH
                        (r:reply)-[:REPLY_TO*1..]->(p)
                     RETURN p, author.UserName AS author, count(r) AS comment_count
                     ORDER BY p.Time DESC 
                     SKIP $skipNum 
                     LIMIT $postPerPage`;
        let params = {"skipNum": neo4j.int(skipNum), "postPerPage": neo4j.int(postPerPage)};
        let result;
        let postSet = [];
        let posts = {
            post_count: 0, 
            posts: []
        }
        try {
            [result, posts.post_count] = await Promise.all([
                session.run(query, params),
                db.getPostCount(criteria)
            ]);
            
        } catch (err) {
            console.log(err);
        }
        let records = result.records;

        for (const record of records) {
            let post = record.get('p'); 
            let author = record.get('author'); 
            let comment_count = record.get('comment_count').low;
            let content = post.properties.Content;
            posts.posts.push({
                author,
                comment_count,
                id: post.properties.id,
                title: post.properties.Title,
                post_time: post.properties.Time,
                abbriv: content.length > 100? content.slice(100) + '...': content
            })
        }
        session.close();
        return posts;
    },

    /**
     * Create a reply node, ‘CREATE_REPLY’ relation between user and the reply 
     *  and ‘REPLY_TO’ relation between the post/reply and the reply
     * @param {*} username String
     * @param {*} content String, the content of the Reply
     * @param {*} id the unique id of the reply
     * @param {*} targetId the Id of the target that user reply to
     * @param {*} time the time that user makes the reply
     * @param {*} type the type of the target (should be "post" or "reply")
     */
    makeReply: async (username, content, id, targetId, time, type) => {
        let session = Neo4jDriver.wrappedSession();
        let query;
        let params;
        if (type === "post") {
            query = `MATCH (u:user {UserName: $username}), (p:post {id: $targetId}) 
                    CREATE (u)-[:CREATE_REPLY]->(r:reply {Content: $content, Time: $time, id: $id})
                    CREATE (r)-[:REPLY_TO]->(p)`;
            params = {"username": username, "targetId": targetId, "content": content, "time": time, "id": id};
        }else if (type === "reply") {
            query = `MATCH (u:user {UserName: $username}), (rp:reply {id: $targetId})
                    CREATE (u)-[:CREATE_REPLY]->(r:reply {Content: $content, Time: $time, id: $id}) 
                    CREATE (r)-[:REPLY_TO]->(rp)`;
            params = {"username": username, "targetId": targetId, "content": content, "time": time, "id": id};
        }
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },   

    /**
     * Delete the reply, ‘CREATE_REPLY’ and any ‘REPLY_TO’ relation with this reply
     * @param {*} id the unique Id of the reply
     */
    deleteReply: async (id) => {
        let session = Neo4jDriver.wrappedSession();

        let query = `MATCH 
                        (r:reply {id: $id})
                    SET r: DELETED`;
        let params = {id};

        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },

    /**
     * Return a set of objects that are comments of the original post where each 
     * object contains id, title and time sorted by time
     * @param {*} id The id of the original post
     * @returns A set of objects where each object contains all the info of a reply
     */
    getComments: async(id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH 
                        (r:reply)-[:REPLY_TO*1..]->(p:post {id: $id}),
                        (u:user)-[:CREATE_REPLY]->(r:reply)
                    OPTIONAL MATCH (r:reply)-[:REPLY_TO]->(upper)
                    RETURN r, upper.id AS reply_to, u.UserName AS author ORDER BY r.Time`;
        let params = {id};
        let result;
        let replies = [];
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }

        let records = result.records; 
        for (const record of records) {
            let author = record.get('author'); 
            let r = record.get('r');
            let reply_to = record.get('reply_to');
            // Populate the replies array
            // Group the sub-comments inside the comments field of first level comments
            let firstLevelReply; 
            let isFirstLevel = true;
            let replyObj = {
                id: r.properties.id,
                reply_to,
                author,
                post_time: r.properties.Time,
                content: r.labels.indexOf('DELETED') === -1? r.properties.Content: '[DELETED]',
                comments: []
            }
            for (firstLevelReply of replies) {
                if (firstLevelReply.__ids.indexOf(reply_to) !== -1) {
                    // If the comment of this record belongs to this first level comment
                    isFirstLevel = false;
                    break; 
                }
            }
            if (isFirstLevel) {
                replyObj.__ids= [replyObj.id], // Temp, will be deleted before returning. 
                replies.push(replyObj);
            }
            else {
                firstLevelReply.comments.push(replyObj);
                firstLevelReply.__ids.push(replyObj.id); 
            }
        }
        for (const reply of replies) {
            delete reply.__ids; 
        }

        session.close();
        return replies;
    },

    /**
     * Create a tag and the ‘HAS_TAG’ relationship between the user and tag. 
     * If the tag exists in the database (has the same tagName), then only the 
     * “HAS_TAG” relationship will be created.
     * @param {*} username String
     * @param {*} tagName String
     */
    addTag: async (username, tagName) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username}) 
                     MERGE (u)-[:TAGGED]->(t:tag {TagName: $tagName})`;
        let params = {"username": username, "tagName": tagName};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete the relationship between the user and the tag, and the tag node if 
     * there are no relationships involving the tag
     * @param {*} username String
     * @param {*} tagName String
     */
    deleteTag: async (username, tagName) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})-[ht:TAGGED]->(t:tag {TagName: $tagName}) 
                     DELETE ht 
                     WITH t 
                     WHERE size(()-[:TAGGED]->(t)) = 0 
                     DELETE t`;
        let params = {"username": username, "tagName": tagName};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
            session.close();
    },

    /**
     * Gets all the tags that a user has.
     * @param {*} username String
     * @returns A set of tagNames
     */
    getTags: async (username) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})-[:TAGGED]->(t:tag) 
                     RETURN t.TagName AS tagName`;
        let params = {"username": username};
        let result;
        let tagSet = [];
        try {
            result = await session.run(query, params);
            result.records.forEach(record => tagSet.push(record.get("tagName")));
        } catch (err) {
            console.log(err);
        }
        session.close();
        return tagSet;
    },

    /**
     * Checks if the user has the given tag
     * @param {*} username String
     * @param {*} tagName String
     * @returns true/false
     */
    userHasTag: async (username, tagName) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})-[ht:TAGGED]->(t:tag {TagName: $tagName}) 
                     RETURN count(ht)`;
        let params = {"username": username, "tagName": tagName};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
        return result.records[0].get(0) != 0;
    },

    /**
     * Create ‘FOLLOW’ relationship between the user and the post
     * @param {*} username String
     * @param {*} id String, the id of the post that user wants to follow
     */
    followPost: async (username, id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username}), 
                           (p:post {id: $id}) 
                    CREATE (u)-[:FOLLOW]->(p)`;
        let params = {"username": username, "id": id};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete ‘FOLLOW’ relationship between the user and the post
     * @param {*} username String
     * @param {*} id String, the id of the post that user wants to follow
     */
    unfollowPost: async (username, id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})-[f:FOLLOW]->(p:post {id: $id}) 
                    DELETE f`;
        let params = {"username": username, "id": id};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return a set of id where each post is followed by the user
     * @param {*} username String
     * @returns A set of id that user follows
     *          Empty if user follows nothing
     */
    getFollowedPostByUser: async (username) => {
        var idSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username}), 
                           "(u)-[:FOLLOW]->(p:post) 
                     RETURN p.id AS id`;
        let params = {"username": username};
        let result;
        try {
            result = await session.run(query, params).then();
            result.records.forEach(record => idSet.push(record.get("id")));
        } catch (err) {
            console.log(err);
        }
        session.close();
        return idSet;
    },

    /**
     * Return a set of username where each user is following this post
     * @param {*} id String
     * @returns A set of users that follow this post
     *          Empty if the post is not followed by any user
     */
    getFollowingUserByPost: async (id) => {
        var usernameSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (p:post {id: $id}), 
                           (u:user)-[:FOLLOW]->(p) 
                     RETURN u.UserName AS userName`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params).then();
            result.records.forEach(record => idSet.push(record.get("userName")));
        } catch (err) {
            console.error(err);
        }
        session.close();
        return usernameSet;       

    },

    /** Store the deliverable info in the database. If the deliverable does not have due, it will be set to -1
     * @param {*} id the id of the deliverable
     * @param {*} title the title of the deliverable
     * @param {*} content deliverable content
     * @param {*} total_points total amount of points available to award for the deliverable
     * @param {*} posted_timestamp the date when the deliverable is posted
     * @param {*} due_timestamp the date when the deliverable will due
     */
    createDeliverable: async (id, name, description, totalPoints, creationTimestamp, dueTimestamp, moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `CREATE (a:deliverable 
            {Id: $id, Name: $name, Description: $description, TotalPoints: $totalPoints, CreatedAt: $creationTimestamp, DueTime: $dueTimestamp})`;
        let params = {
            id, 
            name, 
            description,
            totalPoints,
            creationTimestamp, 
            dueTimestamp,
            moduleId
        }
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);

        }
        session.close();
    },


    /**
     * Set the deliverable to new due. If missing the second paramaters, it will be set to -1
     * @param {*} id the id of the deliverable
     * @param {*} title the title of the deliverable
     * @param {*} total_points total amount of points available to award for the deliverable
     * @param {*} description the new description
     */
    editDeliverable: async (id, name, totalPoints, description) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (a:deliverable {Id: $id}) 
                     SET a.Name = $name, 
                         a.Description = $description,
                         a.TotalPoints = $totalPoints`;
        let params = { id, name, totalPoints, description };
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },
  
    /**
     * Set the deliverable to new due. If missing the second paramaters, it will be set to -1
     * @param {*} id the id of the deliverable
     * @param {*} due the new due of the deliverable
     */
    setDeliverableDue: async (id, due) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (a:deliverable {Id: $id}) 
                     SET a.DueAt = $due`;
        let params = { id , due};

        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },
  
    /**
     * Delete the deliverable and all related submission
     * @param {*} id the id of the deliverable
     */
    deleteDeliverable: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = 
        `
        MATCH (d: deliverable {Id: $id})
        OPTIONAL MATCH (s: submission)-[:SUBMIT_TO]->(d)
        DETACH DELETE d, s
        `;
        let params = { id };
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },
    
    /**
     * Return a object that contains the feature of the deliverable
     * Null o/w
     * @param {*} id the id of the deliverable
     * @returns an object that contains the id, title, media, content, post_time and due_time
     */
    searchDeliverableById: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (a:deliverable {Id: $id}) 
                     RETURN a`
        let params = {"id": id};
        let result;
        try{
            result = await session.run(query, params);
        }catch (err) {
            console.log(err);
        }
        var deliverable;
        if (result.records.length == 0) {
            return null;
        }else {
            deliverable = {
                id: result.records[0].get(0).properties.Id,
                title: result.records[0].get(0).properties.Name,
                description: result.records[0].get(0).properties.Description,
                posted: result.records[0].get(0).properties.CreatedAt,
                totalPoints: result.records[0].get(0).properties.TotalPoints,
                due: result.records[0].get(0).properties.DueAt.low || result.records[0].get(0).properties.DueAt
            }
        }
        session.close();
        return deliverable;
    },

    /**
     * Get all the in-time submission id that related to the deliverable
     * @param {*} id the deliverable id
     * @returns a set that contains all the id of in-time submission
     */
    getInTimeSubmission: async (id) => {
        let submissionSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission)-[:SUBMIT_TO]->(a:deliverable {Id: $id}) 
                     WHERE s.Posted_time <= a.DueTime
                     RETURN s.Id AS submissionId`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params);
            result.records.forEach(record => submissionSet.push(record.get("submissionId")));
        } catch (err) {
            console.error(err);
        }
        session.close();
        return submissionSet;
    },

    /**
     * Get all the late submission id that related to the deliverable
     * @param {*} id the deliverable id
     * @returns a set that contains all the id of late submission
     */
    getLateSubmission: async (id) => {
        let submissionSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission)-[:SUBMIT_TO]->(a:deliverable {Id: $id}) 
                     WHERE s.Posted_time > a.DueTime
                     RETURN s.Id AS submissionId`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params);
            result.records.forEach(record => submissionSet.push(record.get("submissionId")));
        } catch (err) {
            console.error(err);
        }
        session.close();
        return submissionSet;
    },

    /**
     * Create a submission, a CREATE_SUBMISSION relationship with the user
     * and a SUBMIT_TO relationship with the deliverable
     * @param {*} username the username of the user
     * @param {*} deliverableId the id of the deliverable
     * @param {*} id the unique id of the submission
     * @param {*} content the content of the submission
     * @param {*} media the submission media
     * @param {*} posted_timestamp the date when the submission is submitted
     */
    createSubmission: async (username, deliverableId, submissionId, content, media, posted_timestamp) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username}), (a:deliverable {Id: $deliverableId}) 
                     CREATE (u)-[:CREATE_SUBMISSION]->(s:submission 
                            {Id: $submissionId, Content: $content, Media: $media, Posted_time: $posted, Grade: -1}) 
                     CREATE (s)-[:SUBMIT_TO]->(a)`;
        let params = { username, deliverableId, submissionId, content, 
                      media, "posted": neo4j.int(posted_timestamp)};
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },

    /**
     * Set the grade of the submission to the new grade. If missing the second paramaters, it will be set to 0
     * @param {*} id the id of the submission
     * @param {*} comment the comments for the submission
     * @param {*} grade the grade of the submission
     */
    gradeSubmission: async (id, comment, grade = -1) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission {Id: $id}) 
                     SET s.Grade = $grade, s.Comment = $comment`;
        let params = {"id": id, "grade": neo4j.int(grade), "comment":comment};
        try {
            await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        session.close();
    },

        /**
     * Get the submission
     * @param {*} id the submission id
     * @returns the username, content, media, posted time, and grade of the submission
     */
         searchSubmissionById: async (id) => {
            let session = Neo4jDriver.wrappedSession();
            let query = `MATCH (a:submission {Id: $id}), 
                               (u:user)-[:CREATE_SUBMISSION]->(a) 
                         RETURN a, u.UserName`
            let params = {"id": id};
            let result;
            try{
                result = await session.run(query, params);
            }catch (err) {
                console.log(err);
            }
            var submission;
            if (result.records.length == 0) {
                return null;
            }else {
                submission = {
                    id: result.records[0].get(0).properties.Id,
                    username: result.records[0].get(1),
                    content: result.records[0].get(0).properties.Content,
                    media: result.records[0].get(0).properties.Media,
                    posted: result.records[0].get(0).properties.Posted_time["low"],
                    grade: result.records[0].get(0).properties.Grade["low"]
                }
            }
            session.close();
            return submission;
        },
    
    /**
     * Get the grade of the submission
     * @param {*} id the submission id
     * @returns the grade of the submission
     */
    getSubmissionGrade: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission {Id: $id}) 
                     RETURN s.Grade AS grade`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        let grade = result.records[0].get('grade');
        session.close();
        return grade["low"];
    },

    /**
     * Get the comment of the submission
     * @param {*} id the submission id
     * @returns the comment of the submission
     */
    getSubmissionComments: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission {Id: $id}) 
                     RETURN s.Comment AS comment`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.error(err);
        }
        let comment = result.records[0].get('comment');
        session.close();
        return comment;
    },

    /**

     * Get all courses
     * @param {*} username (optional)
     *      when provided, this function will also return whether the user is enrolled in
     *      the course or not. 
     * @param {*} criteria can be an object with any combinition of the following fields
     *      {
     *          'name_contains': string,
     *          'enrolled_by': string,
     *          'name_equals': string,
     *          'has_module': string,
     *          'has_content': string
     *      }
     */
    searchCourses:  async(username, criteria) => {
        var courseSet = [];
        let session = Neo4jDriver.wrappedSession();

        let constraints = [];
        // TODO: clean up this section 
        if ('name_contains' in criteria) {
            constraints.push(`toLower(c.Name) =~ '.*${criteria.name_contains.toLowerCase()}.*'`);
        }
        if ('has_module' in criteria) {
            constraints.push(`(c)-[:HAS_MODULE]->(:module {Id: $has_module})`);
        }
        if ('has_content' in criteria) {
            constraints.push(`(c)-[:HAS_MODULE]->()-[:HAS_CONTENT]-({Id: $has_content})`); 
        }
        if ('has_submission' in criteria) {
            constraints.push(`(c)-[:HAS_MODULE]->()-[:HAS_CONTENT]->(:deliverable)<-[:SUBMIT_TO]-(:submission {Id: $has_submission})`); 
        }
        if ('name_equals' in criteria) {
            constraints.push(`c.Name = $name_equals`); 
        }
        if ('enrolled_by' in criteria) {
            constraints.push(`(:user {UserName: $enrolled_by})-[:ENROLLED_IN]->(c)`); 
        }if ('has_submission' in criteria) {
            constraints.push(`(c)-[:HAS_MODULE]->()-[:HAS_CONTENT]->(:deliverable)<-[:SUBMIT_TO]-(:submission {Id: $has_submission})`); 
        }
        let constraintStr = constraints.length === 0? 
            '': 
            `WHERE ${constraints.join(' AND ')}`; 
        let query = `MATCH 
                        (c:course)
                    ${constraintStr}
                    OPTIONAL MATCH
                        (u:user)-[:TEACH_COURSE]->(c)
                     RETURN c, u.UserName AS instructor`;
        let params = criteria; 
        if (username !== undefined && username !== null) {
            query = 
                `MATCH 
                    (c:course)
                ${constraintStr}
                OPTIONAL MATCH
                    (u:user)-[:TEACH_COURSE]->(c)
                OPTIONAL MATCH 
                    (s:user {UserName:$username})-[:ENROLLED_IN]->(c)
                RETURN c, u.UserName AS instructor, count(s) AS enrolled`;
            params.username = username; 
        }
        let result;
        try {
            result = await session.run(query, params);
            let records = result.records;
            for (let i = 0; i < records.length; i++) {
                let course = records[i].get('c');
                let instructor = records[i].get('instructor');
                let courseData = {
                    name: course.properties.Name,
                    description: course.properties.Description,
                    instructor
                }
                if (username !== undefined && username !== null) {
                    let enrolled = records[i].get('enrolled').low;
                    if (enrolled !== 0) {
                        courseData.enrolled = true; 
                    }
                }
                courseSet.push(courseData)
            }
        } catch (err) {
            console.log(err);
        }

        session.close();
        return courseSet;
    },

    /**
     * Create the course in the database and its relation to the instructor
     * @prereq the instructor must exist, and there are no course with the same name 
     *      as `name`
     * 
     * @param {*} name the unique name of the course
     * @param {*} instructor a set of username of the instructors
     * @param {*} description description of the course
     */
    createCourse: async (name, instructor, description) => {
        let session = Neo4jDriver.wrappedSession();
        let query = 
        `
        MATCH (i:user {UserName: $instructor})
        CREATE (i)-[:TEACH_COURSE]->(c:course {Name: $name, Description: $description})
        `
        let params = {name, instructor, description}; 
        let res; 
        try {
            res = await session.run(query, params);
        } catch (err) {
            console.log(err);

        }
        session.close();
    },
  
    /**
     * Edit the course description
     * 
     * @prereq instructor and course specified exists. 
     * 
     * @param {*} name the name of the course
     * @param {*} description optional. the new description
     * @param {*} instructor optional. username of the new instructor
     */
    editCourse: async (name, description, instructor) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH 
                        (c:course {Name: $name}) 
                        ${instructor === undefined? '': ',(:user)-[t:TEACH_COURSE]->(c), (i:user {UserName: $instructor})'}
                    ${description === undefined? '': 'SET c.Description = $description'}
                    ${instructor === undefined? '': 'DELETE t CREATE (i)-[:TEACH_COURSE]->(c)'}`;
        let params = {name, description, instructor};

        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**

     * Create a ENROLLED_IN relationship between the user and the course
     * @param {*} name the name of the course
     * @param {*} username the name of the user
     */
    enrollCourse: async (name, username) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `
        MATCH 
            (u:user {UserName: $username}),
            (c:course {Name: $name})
        MERGE (u)-[:ENROLLED_IN]->(c)
        `;

        let params = {"username": username, "name": name};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**

     * DELETE the ENROLLED_IN relationship between the user and the course
     * @param {*} name the name of the course
     * @param {*} username the name of the user
     */
    dropCourse: async (name, username) => {
        let session = Neo4jDriver.wrappedSession();
        let query = 
        `MATCH (:user {UserName: $username})-[e:ENROLLED_IN]->(:course {Name: $name}) 
        DELETE e`;
        let params = {"username": username, "name": name};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Search the course by its name and return an object containing its feature
     * Null o/w
     * @param {*} name the name of the course
     * @returns return an object containing its name, instructor and description
     */
    searchCourseByName: async (name) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (c:course {Name: $name}) 
                     RETURN c`;
        let params = {"name": name};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        var course;
        if (result.records.length == 0) {
            return null;
        }else {
            course = {
                name: result.records[0].get(0).properties.Name,
                instructor: result.records[0].get(0).properties.Instructor,
                description: result.records[0].get(0).properties.Description
            }
        }
        session.close();
        return course;
    },

    /**
     * Return a set of courses that the instructor create
     * @param {*} instructor the username of the instructor
     * @returns a set of courses that the instructor create
     */
    searchCourseByInstructor: async (instructor) => {
        var courseSet= [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {Username: $instructor})-[:TEACH_COURSE]->(c:course) 
                     RETURN c.Name AS name`;
        let params = {"instructor": instructor};
        let result;
        try {
            result = await session.run(query, params);
            result.records.forEach(record => courseSet.push(record.get("name")));
        } catch (err) {
            console.log(err);
        }
        session.close();
        return courseSet;
    },

    /**
     * Return all the course that user enrols in
     * @param {*} username the username
     * @returns a set of object that contains name, instructor and description of a course
     */
    getEnroledCourse: async (username) => {
        var courseSet = [];
        let courseNameSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {Username: $username})-[:ENROLLED_IN]->(c:course) 
                     RETURN c.Name AS name`;
        let params = {"username": username};
        let result;
        try {
            result = await session.run(query, params);
            result.records.forEach(record => courseNameSet.push(record.get("name")));
        } catch (err) {
            console.log(err);
        }
        session.close();
        for (let i = 0; i < courseNameSet.length; i++) {
            courseSet.push(await this.searchCourseByName(courseNameSet[i]));
        }
        return courseSet;
    },

    /**
     * Check if a user is enrolled in a course
     * @param {*} username the username
     * @param {*} courseName the name of the course
     * @returns true if enrolled, false otherwise
     */
    checkEnrollment: async (username, courseName) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $username})-[:ENROLLED_IN]->(c:course {Name: $courseName}) 
                     RETURN c.Name AS name`;
        let params = {"username": username, "courseName": courseName};
        let result;
        try {
            result = await session.run(query, params);
            
        } catch (err) {
            console.log(err);
        }
        return result.records.length > 0;
    },
    
    /**
     * Create the video in the database
     * @param {*} id the id of the video
     * @param {*} name the name of the video
     * @param {*} description the description of the video
     * @param {*} url the url of the video
     * @param {*} posted_timestamp the posted time of the video
     */
    createVideo: async (id, name, description, vid, posted_timestamp, moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `
        MATCH (m:module {Id: $moduleId})
        MERGE (v:video {Id: $id, Name: $name, Description: $description, Source: $source, Vid: $vid, Post_time: $posted})
        MERGE (m)-[:HAS_CONTENT]->(v)
        `;
        let params = {id, name, description, vid, "posted": posted_timestamp, source: 'YouTube', moduleId};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Edit the description and url for the video
     * @param {*} id the id of the video
     * @param {*} description the new description
     * @param {*} url the new url
     */
    editVideo: async (id, name, description, vid) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (v:video {Id: $id}) 
                     SET v.Description = $description, 
                         v.Name = $name,
                         v.Vid = $vid`;
        let params = { id, description, vid, name };
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete the video
     * @param {*} id the id of the video
     */
    deleteVideo: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (v:video {Id: $id})
                     DETACH DELETE v`;
        let params = { id };
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return a object that contains the feature of the video
     * Null o/w
     * @param {*} id the id of the video
     * @returns an object that contains the id, name, description, url and post-time
     */
    searchVideoById: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (v:video {Id: $id}) 
                     RETURN v`
        let params = {"id": id};
        let result;
        try{
            result = await session.run(query, params);
        }catch (err) {
            console.log(err);
        }
        var video;
        if (result.records.length == 0) {
            return null;
        }else {
            video = {
                id: result.records[0].get(0).properties.Id,
                name: result.records[0].get(0).properties.Name,
                description: result.records[0].get(0).properties.Description,
                url: result.records[0].get(0).properties.Url,
                postTime: result.records[0].get(0).properties.Post_time,
            }
        }
        session.close();
        return video;
    },

    /**
     * Create the Reading in the database
     * @param {*} id the id of the Reading
     * @param {*} name the name of the Reading
     * @param {*} description the description of the Reading
     * @param {*} path the path of the file
     * @param {*} posted_timestamp the posted time of the Reading
     */
    createReading: async (id, name, description, path, posted_timestamp) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `CREATE (r:reading {Id: $id, Name: $name, Description: $description, Path: $path, Post_time: $posted})`;
        let params = {"id": id, "name": name, "description": description, "path": path, "posted": posted_timestamp};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Edit the name and content of the reading
     * @param {*} id the id of the reading
     * @param {*} name the new name
     * @param {*} description the new description
     */
    editReading: async (id, name, description) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (r:reading {Id: $id}) 
                     SET r.Name = $name, 
                         r.Description = $description`;
        let params = {"id": id, "name": name, "description": description};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete the reading
     * @param {*} id the id of the reading
     */
    deleteReading: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (r:reading {Id: $id})
                     DETACH DELETE r`;
        let params = {"id": id};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return a object that contains the feature of the reading
     * Null o/w
     * @param {*} id the id of the reading
     * @returns an object that contains the id, name, description, path and post-time
     */
    searchReadingById: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (r:reading {Id: $id}) 
                     RETURN r`
        let params = {"id": id};
        let result;
        try{
            result = await session.run(query, params);
        }catch (err) {
            console.log(err);
        }
        var reading;
        if (result.records.length == 0) {
            return null;
        }else {
            reading = {
                id: result.records[0].get(0).properties.Id,
                name: result.records[0].get(0).properties.Name,
                description: result.records[0].get(0).properties.Description,
                path: result.records[0].get(0).properties.Path,
                postTime: result.records[0].get(0).properties.Post_time,
            }
        }
        session.close();
        return reading;
    },

    /**
     * Create a module of a course and a relationship between the course and the module
     * @param {*} course the name of the course
     * @param {*} id the module id
     * @param {*} name the name of the id
     */
    createModule: async (courseName, moduleId, moduleName, timestamp) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (c:course {Name: $courseName}) 
                     MERGE (c)-[:HAS_MODULE]->(:module {Id: $moduleId, Name: $moduleName, CreatedAt: $timestamp})`;
        let params = {courseName, moduleId, moduleName, timestamp};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Create HAS_CONTENT relationship with an object
     * @param {*} type type of object (deliverable, video or reading)
     * @param {*} objId the id of the object
     * @param {*} moduleId the id of the module
     */
    addContentIntoModule: async (type, objId, moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (o:${type} {Id: $objId}), (m:module {Id: $moduleId}) 
                     CREATE (m)-[:HAS_CONTENT]->(o)`;
        let params = {"type": type, "objId": objId, "moduleId": moduleId};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete HAS_CONTENT relationship with an object
     * @param {*} type type of object (deliverable, video or reading)
     * @param {*} objId the id of the object
     * @param {*} moduleId the id of the module
     */
    deleteContent: async (type, objId, moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $moduleId})-[hs:HAS_CONTENT]->(o:$type {Id: $objId}) 
                     DELETE hs`;
        let params = {"moduleId": moduleId, "type": type, "objId": objId};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete all the realationship of content with a module
     * @param {*} moduleId the module id
     */
    deleteAllContent: async (moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $moduleId})-[hs:HAS_CONTENT]->(o) 
                     DELETE hs`;
        let params = {"moduleId": moduleId};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return a set of object that contains all the deliverable in the module
     * @param {*} moduleId the id of the module
     * @returns a set of object that each object contains deliverable title, media, content and due
     */
    getAllDeliverable: async (moduleId) => {
        var deliverableSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $moduleId})-[:HAS_CONTENT]->(a:deliverable) 
                     RETURN a`
        let params = {"moduleId": moduleId};
        let result;
        try {
            result = await session.run(query, params);
            records = result.records;
            for (let i = 0; i < records.length; i++) {
                let deliverable = records[i].get(0);
                deliverableSet.push({
                    type: "Deliverable",
                    title: deliverable.properties.Title,
                    media: deliverable.properties.Media,
                    content: deliverable.properties.Content,
                    due: deliverable.properties.Due_time
                })
            }
        } catch (err) {
            console.log(err);
        }
        session.close();
        return deliverableSet;
    },
    
    /**
     * Return a set of object that contains all the video in the module
     * @param {*} moduleId the id of the module
     * @returns a set of object that each object contains video name, description and url
     */
    getAllVideo: async (moduleId) => {
        var videoSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $moduleId})-[:HAS_CONTENT]->(v:video) 
                     RETURN v`
        let params = {"moduleId": moduleId};
        let result;
        try {
            result = await session.run(query, params);
            records = result.records;
            for (let i = 0; i < records.length; i++) {
                let video = records[i].get(0);
                videoSet.push({
                    type: "video",
                    name: video.properties.Name,
                    description: video.properties.Description,
                    url: video.properties.Url
                })
            }
        } catch (err) {
            console.log(err);
        }
        session.close();
        return videoSet;
    },

    /**
     * Return a set of object that contains all the reading in the module
     * @param {*} moduleId the id of the module
     * @returns a set of object that each object contains reading name, description and path
     */
    getAllReading: async (moduleId) => {
        var readingSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $moduleId})-[:HAS_CONTENT]->(r:reading) 
                     RETURN r`
        let params = {"moduleId": moduleId};
        let result;
        try {
            result = await session.run(query, params);
            records = result.records;
            for (let i = 0; i < records.length; i++) {
                let reading = records[i].get(0);
                readingSet.push({
                    type: "Reading",
                    name: reading.properties.Name,
                    description: reading.properties.Description,
                    path: reading.properties.Path
                })
            }
        } catch (err) {
            console.log(err);
        }
        session.close();
        return readingSet;
    },

    /**
     * Return a set that contains all the content in the module
     * @param {*} moduleId the id of the module
     * @returns a set that contains all the content in the module where each content contains its feature
     */
    getModule: async (moduleId) => {
        let deliverableSet = await this.getAllDeliverable(moduleId);
        let videoSet = await this.getAllVideo(moduleId);
        let readingSet = await this.getAllReading(moduleId);
        var moduleContent = [];
        moduleContent.push.apply(a, deliverableSet);
        moduleContent.push.apply(a, videoSet);
        moduleContent.push.apply(a, readingSet);
        return moduleContent;
    },

    /**
     * Get all the modules and their content of a course 
     * Null if the course does not have any modules
     * @param {*} course the name of the course
     * @returns a set where each object contains the name of the module and its content
     */
    getAllModules: async (course) => {
        let session = Neo4jDriver.wrappedSession();
        let query = 
        `
        MATCH 
            (c:course {Name: $course}),
            (c)-[:HAS_MODULE]->(m:module)
        OPTIONAL MATCH 
            (m)-[:HAS_CONTENT]->(content)
        RETURN  
            m, collect(content) AS contents ORDER BY m.CreatedAt
        `;
        let params = { course };
        let result;
        try {
            result = await session.run(query, params);
            records = result.records;
        } catch (err) {
            console.log(err);
        }
        let modules = []; 
        /*
            Record structure: 
                .get('m') => module info
                .get('contents') => array of content info that belongs to the module 
        */
        for (const record of result.records) {
            let moduleRecord = record.get('m');
            let moduleInfo = {
                id: moduleRecord.properties.Id,
                name: moduleRecord.properties.Name,
                contents: []
            }
            let contents = record.get('contents'); 
            moduleInfo.contents = [];
            for (const content of contents) {
                let type = content.labels[0]; 
                let contentInfo = {
                    id: content.properties.Id,
                    name: content.properties.Name,
                    description: content.properties.Description, 
                    type
                }
                // Type specific fields
                switch (type) {
                    case 'reading': 
                        contentInfo.path = content.properties.Path; 
                        break; 
                    case 'video': 
                        contentInfo.source = content.properties.Source;
                        contentInfo.vid = content.properties.Vid;  
                        break; 
                    case 'deliverable': 
                        if (typeof content.properties.DueTime === 'number') {
                            contentInfo.due = content.properties.DueTime;
                        }
                        else {
                            contentInfo.due = content.properties.DueTime.low; 
                        }
                        contentInfo.totalPoints = content.properties.TotalPoints; 
                        break; 
                    default: break; 
                }
                moduleInfo.contents.push(contentInfo); 
            }
            modules.push(moduleInfo); 
        }

        session.close();
        return modules;
    },

    /**
     * Edit the module with the new name
     * @param {*} id the id of the module
     * @param {*} name the new name of the module
     */
    editModule: async (id, name) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $id}) 
                     SET m.Name = $name`;
        let params = {"id": id, "name": name};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Delete the module and any relationship with the module
     * @param {*} id the id of the module
     */
    deleteModule: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $id})
                    OPTIONAL MATCH (m)-[:HAS_CONTENT]->(c)
                    DETACH DELETE m, c`;
        let params = { id };
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return an object that contains the feature of the module
     * Null o/w
     * @param {*} id the id of the module
     * @returns an object that contains the course, id and name of a module
     */
    searchModuleById: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (m:module {Id: $id}) 
                     RETURN m`;
        let params = { id };
        console.log(query); 
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        var module;
        if (result.records.length == 0) {
            return null;
        }else {
            module = {
                id: result.records[0].get(0).properties.Id,
                name: result.records[0].get(0).properties.Name,
            }
        }
        session.close();
        return module;
    },

    /**
     * Return the course of the module
     * @param {*} moduleId module id
     * @returns the course name
     */
    searchCourseByModule: async (moduleId) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (c:course)-[:HAS_MODULE]->(:module {Id: $id}) 
                     RETURN c.Name as name`;
        let params = {"id": moduleId};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        if (result.records.length == 0) {
            return null;
        }
        session.close();
        return result.records[0].get("name");
    },

      
    /**
     * Check whether the user is an instructor of the course
     * @param {*} moduleId the id of the module
     * @param {*} instructor the username of the module
     * @returns true if the user is an instructor
     *          false if not
     */
    checkIsInstructor: async (moduleId, instructor) => {
        let courseName = await db.searchCourseByModule(moduleId);

        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $instructor})-[cc:TEACH_COURSE]->(c:course {Name: $courseName}) 
                     RETURN cc`;
        let params = {"instructor": instructor, "courseName": courseName};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        return result.records.length > 0;
    },

    /**
     * Check whether the user is an instructor of the course
     * @param {*} courseName the name of course
     * @param {*} instructor the username of the module
     * @returns true if the user is an instructor
     *          false if not
     */
    checkIsInstructorFromCourse: async (courseName, instructor) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u:user {UserName: $instructor})-[cc:TEACH_COURSE]->(c:course {Name: $courseName}) 
                     RETURN cc`;
        let params = {"instructor": instructor, "courseName": courseName};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        return result.records.length > 0;
    },
    
    /**
     * Delete all the module in the course
     * @param {*} course the name of the course
     */
    deleteAllModule: async (course) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (c:course {Name: $course}), 
                           (c)-[:HAS_MODULE]->(m:module), 
                           (m)-[:HAS_CONTENT]->(o), 
                           (o)<-[:SUBMIT_TO]-(s:submission) 
                     DELETE s, o, m`;
        let params = {"course": course};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * DELETE the course
     * @param {*} name the name of the course
     */
    deleteCourse: async (name) => {
        let session = Neo4jDriver.wrappedSession();
        let query = 
        `
        MATCH (c: course {Name: $name})
        OPTIONAL MATCH (c)-[:HAS_MODULE]-(m: module)
        OPTIONAL MATCH (m)-[:HAS_CONTENT]-(content)
        DETACH DELETE c, m, content
        `;
        let params = {name};
        try {
            await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
    },

    /**
     * Return the content of the course
     * Null o/w
     * @param {*} courseName the name of the course
     * @returns an object that contains course info and modules
     */
    getCourseContent: async (courseName) => {
        let course = await this.searchCourseByName(courseName);
        if (course == null) {
            return null;
        }
        var courseContent = {
            name: course.name,
            instructor: course.instructor,
            description: course.description,
            modules: await this.getAllModules(courseName)
        };
        return courseContent;
    },

    /**
     * Check if the course exists
     * @param {*} courseName the course name
     * @returns true if exists. false o/w
     */
    courseExists: async (courseName) => {
        const session = Neo4jDriver.wrappedSession();
        let query = 
        `
        MATCH 
            (c:course {Name: $courseName})
        RETURN 
            count(c) AS exists
        `
        let params = {courseName}
        let result = await session.run(query, params); 
        let exists = result.records[0].get('exists').low !== 0; 
        session.close(); 
        return exists; 
    },

    /**
     * Check whether the submission exist
     * @param {*} id the id of the submission
     * @returns True if exists. False o/w
     */
    checkSubmissionExist: async (id) => {
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (s:submission {Id: $id}) 
                     RETURN s`;
        let params = {"id": id};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        session.close();
        return result.records.length > 0;
    },

    /**
     * Return all the deliverables of a course
     * @param {*} course course name
     * @returns a set where each object contains all the feature of a deliverable
     */
    getCourseDeliverables: async (course) => {
        var deliverableSet = [];
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (c:course {Name: $name})-[:HAS_MODULE]->(:module)-[:HAS_CONTENT]->(d:deliverable) 
                     RETURN d`;
        let params = {"name": course};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        let records = result.records
        for (let i = 0; i < records.length; i++) {
            let deliverable = records[i].get(0);
            deliverableSet.push({
                type: "Deliverable",
                title: deliverable.properties.Title,
                media: deliverable.properties.Media,
                content: deliverable.properties.Content,
                due: deliverable.properties.Due_time
            })
        }
        session.close();
        return deliverableSet;
    },

    /**
     * Return all the deliverables of a course
     * @param {*} username the username
     * @returns a set where each object contains all the feature of a deliverable
     */
    getUserDeliverables: async (username) => {
        var deliverableSet = []
        let session = Neo4jDriver.wrappedSession();
        let query = `MATCH (u: user{UserName: $username}) 
                     OPTIONAL MATCH (u)-[:ENROLLED_IN]->()-[:HAS_MODULE]->()-[:HAS_CONTENT]->(d0: deliverable) 
                     OPTIONAL MATCH (u)-[:TEACH_COURSE]->()-[:HAS_MODULE]->()-[:HAS_CONTENT]->(d1: deliverable) 
                     RETURN d0, d1`;
        let params = {"username": username};
        let result;
        try {
            result = await session.run(query, params);
        } catch (err) {
            console.log(err);
        }
        let records = result.records
        for (let i = 0; i < records.length; i++) {
            let deliverable = records[i].get(0) != null ? records[i].get(0) : records[i].get(1);
            deliverableSet.push({
                type: "Deliverable",
                title: deliverable.properties.Title,
                media: deliverable.properties.Media,
                content: deliverable.properties.Content,
                due: deliverable.properties.DueTime
            })
        }
        session.close();
        return deliverableSet;
    },

    /**
     * Return a set of submission where each submission has its own features as in database
     * @param {*} idSet the set of submission Id
     * @returns the submission set
     */
    getAllSubmission: async (idSet) => {
        var submissionSet = [];
        for (let i = 0; i < idSet.length; i++) {
            submissionSet.push(await db.searchSubmissionById(idSet[i]));
        }
        return submissionSet;
    },
    getAllSubmissionsOfDeliverableByUser: async (deliverableId, username) => {
        let session = Neo4jDriver.wrappedSession(); 
        const query = `
        MATCH (:user {UserName: $username})-[:CREATE_SUBMISSION]->(s:submission)-[:SUBMIT_TO]->(:deliverable {Id: $deliverableId})
        RETURN s
        `
        const params = { deliverableId, username };
        let result; 
        let submissions = []; 
        try {
            result = await session.run(query, params); 
            for (const record of result.records) {
                const s = record.get('s').properties; 
                const submission = {
                    id: s.Id,
                    content: s.Content,
                    media: s.Media,
                    posted: s.Posted_time.low || s.Post_time, 
                    comment: s.Comment || "",
                    grade: s.Grade.low || s.Grade
                }
                submissions.push(submission)
            }
        }
        catch (err) {
            console.error(err); 
            return []; 
        }
        return submissions; 
    }

}; 

module.exports = db; 