import React, {Component} from 'react'; 
import './commentFooter.css'; 
import Utils from '../../../../utils'; 
import MakeComment from '../../makeComment/makeComment';

// Comments | share | delete | Post at

/*
    -props: 
        - reply
*/

const deleteContentURL = "/community/deleteContent"

export default class CommentFooter extends Component {

    state = {
        commentInput: false
    }

    showCommentInput = () => {
        this.setState({commentInput: true});
    }
    hideCommentInput = () => {
        this.setState({commentInput: false});
    }

    copyURL = () => {
        let inputc = document.body.appendChild(document.createElement("input"));
        let commentURL = window.location.href + `#${this.props.reply.id}`;
        inputc.value = commentURL;
        // inputc.focus();
        inputc.select();
        document.execCommand('copy');
        inputc.parentNode.removeChild(inputc);
        alert("URL Copied.");
    }

    deleteComment = async () => {
        // Confirm
        if (!window.confirm('Are you sure you want to delete this comment? ')) {
            return; 
        }

        let res;
        try {
            res = await fetch(
                deleteContentURL,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id: this.props.reply.id
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
        catch (err) {
            console.log(err); 
            alert('Internet Failure'); 
        }
        
        if (res.ok) {
            window.location.reload(); 
        }
        else {
            let body = await res.json(); 
            alert(body.message); 
        }
    }

    render() {

        const reply = this.props.reply; 
        let canDelete = (
            localStorage.getItem('username') === reply.author
        ) || (localStorage.getItem('isAdmin') === 'true');
        return (
        <div>
            <table className="comment-footer-table">
                <colgroup>
                    <col style={{width:'10%'}} />
                    <col style={{width:'10%'}} />
                    <col style={{width:'10%'}} />
                    <col style={{width:'70%'}} />
                </colgroup>
                <tbody>
                    <tr>
                        <td>
                            <img 
                            src="/icons/chat.png" 
                            alt="reply" 
                            className="comment-footer-icon"
                            onClick={this.showCommentInput}
                            ></img>
                        </td>
                        <td>
                            <img 
                            src="/icons/share.png" 
                            alt="share" 
                            className="comment-footer-icon"
                            onClick={this.copyURL}
                            ></img>
                        </td>
                        <td>
                        {
                            canDelete? 
                                <img src="/icons/garbage.png" 
                                alt="delete" 
                                className="comment-footer-icon"
                                onClick={this.deleteComment}></img>:
                                <></>
                        }
                        </td>
                        <td style={{textAlign: 'right'}}>
                            <span>Posted at: {Utils.timeStampToTime(reply.post_time)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            {
                this.state.commentInput? 
                <MakeComment reply_to={reply.id} discard={this.hideCommentInput}/>:
                <></>
            }
        </div>
        )
    }
}