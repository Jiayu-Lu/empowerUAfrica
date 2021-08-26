import React, {Component} from 'react'; 
import './makeComment.css'; 

const createCommentURL = '/community/createComment'; 

/*
    -props:
        - id: the id that the made comment will reply to. 
        - discard: callback function to hide this comment box. 
*/

export default class MakeComment extends Component {
    discard = () => {
        if (!window.confirm('Are you sure you want to discard your comment? ')) {
            return;
        }
        this.props.discard(); 
    }

    submitComment= async () => {
        let res;
        const reply_to = this.props.reply_to; 
        let replyInput = document.getElementById(`comment-textarea-${reply_to}`);
        if (replyInput.value.length === 0) {
            return; 
        }
        try {
            res = await fetch(
                createCommentURL,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        reply_to: reply_to,
                        body: replyInput.value
                    }),
                    headers: {
                        'content-type': 'application/json'
                    }
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
            alert(body.message);
            return; 
        }
        window.location.reload(); 
    }

    render() {
        const reply_to = this.props.reply_to; 
        return (
            <div className="make-comment-box">
                <textarea className="make-comment-textarea" id={`comment-textarea-${reply_to}`}>

                </textarea>
            <button className="submit-btn" onClick={this.submitComment}>Submit</button>
            <button className="discard-btn" onClick={this.discard}>Discard</button>
            </div>
        )
    }
}