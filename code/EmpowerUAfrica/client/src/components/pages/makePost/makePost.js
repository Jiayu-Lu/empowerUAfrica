import React, { Component } from 'react'; 
import './makePost.css';

const createPostURL = '/community/createPost'; 

export default class community extends Component{

    createPost = async () => {
        let title = document.getElementById('makePost_title').value; 
        let content = document.getElementById('makePost_content').value; 
        if (title.length === 0 || content.length === 0) {
            return; 
        }

        let res; 
        try {
            res = await fetch(
                createPostURL,
                {
                    method: 'POST', 
                    body: JSON.stringify({
                        title,
                        body: content
                    }),
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );
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
            alert(body.message); 
            return; 
        }

        window.location.href = '/community'; 

    }

    render() {

        return (
            <div className="makePost">

                <div>

                </div>

                <div className="makePost_center">
                    <div className="makePost_title">
                        {/* post title */}
                        <h2>Title</h2>
                        <textarea id="makePost_title" ></textarea>
                    </div>
                    <div className="makePost_content">
                        {/* post content */}
                        <h2>Content</h2>
                        <textarea id="makePost_content"></textarea>
                    </div>
                    {/* submit the post */}
                    <button id="createPost" onClick={this.createPost}>Create Post</button>

                </div>

                <div>

                </div>

            </div>
        )
    }
}