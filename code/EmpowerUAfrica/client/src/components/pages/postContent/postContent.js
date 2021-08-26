import React, { Component } from 'react'; 
import './postContent.css';
import Post from '../../components/post/post';
import {Reply} from '../../components/postReply/postReply';
import Utils from '../../../utils';

const getPostContentURL = '/community/getPostContent'; 

export default class postContent extends Component{

    activateMakeComment = ()=> {
        let deactivator = document.querySelector("#makecomment_deactivator");
        let activator = document.querySelector("#makecomment_activator");
        let makeCommentArea = document.querySelector(".postContent_makeComment");
        activator.style.display = "none";
        deactivator.style.display = "block";
        makeCommentArea.style.display = "block";
    }

    deactivateMakeComment = ()=> {
        let deactivator = document.querySelector("#makecomment_deactivator");
        let activator = document.querySelector("#makecomment_activator");
        let makeCommentArea = document.querySelector(".postContent_makeComment");
        activator.style.display = "block";
        deactivator.style.display = "none";
        makeCommentArea.style.display = "none";
    }

    state = {
        postContent: null,
        error: null
    }

    async getPostContent(postId) {
        let res;
        let url = `${getPostContentURL}?post_id=${postId}`; 
        try {
            res = await fetch(
                url,
                {
                    method: 'GET'
                }
            )
        }
        catch (err) {
            console.error(err); 
            this.setState({
                error: 'Internet Failure: Failed to connect to server.'
            })
            return;
        }
        let body; 
        try {
            body = await res.json();
        }
        catch (err) {
            console.error(err); 
            return; 
        }

        if (!res.ok) {
            this.setState({error: body.message}); 
            return; 
        }
        let postContent = body; 

        let users = [postContent.author];
        for (const comment of postContent.comments) {

            if (users.indexOf(comment.author) === -1) {
                users.push(comment.author)
            }
            
            if (comment.comments !== undefined) {
                for (const subcomment of comment.comments) {
                    if (users.indexOf(subcomment.author) === -1) {
                        users.push(subcomment.author)
                    }
                }
            }
        }

        let usersAbstract = await Utils.getUsersAbstract(users); 
        console.log(usersAbstract); 

        postContent.authorAbstract = usersAbstract[postContent.author]; 
        postContent.comment_count = 0;
        for (const comment of postContent.comments) {
            comment.authorAbstract = usersAbstract[comment.author]; 
            comment.comment_count = 0; 
            let __idToCommentObj = {}; 
            if (comment.comments !== undefined) {
                for (const subcomment of comment.comments) {
                    __idToCommentObj[subcomment.id] = subcomment; 

                    subcomment.reply_to_obj = null; 
                    if (subcomment.reply_to !== comment.id) {
                        subcomment.reply_to_obj = __idToCommentObj[subcomment.reply_to]; 
                    }

                    subcomment.authorAbstract = usersAbstract[subcomment.author]; 
                    comment.comment_count ++; 
                }
            }
            
            postContent.comment_count += comment.comment_count + 1;
        }
        this.setState({postContent, postId, usersAbstract}); 
        
    }

    componentDidMount() {
        const postId = this.props.match.params.postId; 
        this.getPostContent(postId); 
    }

    render() {
        const postContent = this.state.postContent; 
        if (postContent === null) {
            return(<></>); 
        }
        let replies = postContent.comments.map(
            comment => <Reply reply={comment} key={comment.id}/>
        )
        console.log(postContent); 
        return (
            <div className="post-content">

                <div>
                    <h3 className="warningMsg">{this.state.error}</h3>
                </div>

                <div className="post-content-column">
                    <div className="postContent_post">
                        {/* post information */}
                        <Post post={postContent} in_post="true"/>
                    </div>
                    <div>

                    </div>

                    {/* container for postReply */}
                    <div>
                        {replies}
                    </div>
                </div>

                <div>

                </div>

            </div>
        )
    }
}