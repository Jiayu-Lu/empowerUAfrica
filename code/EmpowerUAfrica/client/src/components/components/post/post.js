import React, { Component } from 'react'; 
import './post.css';
import { UserAbstract } from '../userAbstract/userAbstract';
import Utils from '../../../utils';
import MakeComment from '../makeComment/makeComment';

const deleteContentURL = "/community/deleteContent"

export default class post extends Component{
    state = {
        commentInput: false
    }

    showCommentInput = () => {
        this.setState({commentInput: true});
    }
    hideCommentInput = () => {
        this.setState({commentInput: false});
    }

    copyURL = ()=> {
        var inputc = document.body.appendChild(document.createElement("input"));
        inputc.value = window.location.href.split('/').slice(0, 3).join('/') + '/community/post/' + this.props.post.id;
        inputc.select();
        document.execCommand('copy');
        inputc.parentNode.removeChild(inputc);
        alert("URL Copied.");
    }

    deletePost = async () => {
        // Confirm
        if (!window.confirm('Are you sure you want to delete this post? ')) {
            return; 
        }

        let res;
        try {
            res = await fetch(
                deleteContentURL,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id: this.props.post.id
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
            if (this.props.in_post) {
                window.location.replace('/community');
            }
            else {
                window.location.reload(); 
            }
        }
        else {
            let body = await res.json(); 
            alert(body.message); 
        }
    }

    render() {
        let post = this.props.post;
        let author = this.props.post.authorAbstract;  
        let in_post = this.props.in_post; 
        console.log(post); 
        if (post === undefined) {
            return (<h2>Error: No Post Data</h2>); 
        }
        let canDelete = (
            localStorage.getItem('username') === post.author
        ) || (localStorage.getItem('isAdmin') === 'true');
        let makeComment = <></>;
        if (this.state.commentInput) {
            makeComment = <MakeComment reply_to={post.id} discard={this.hideCommentInput}/>

        }

        return (
            <div className="post">
                <div className="post-user-abstract">
                    <UserAbstract user={author}></UserAbstract>
                </div>
                
                <div className="post-abstract">
                {
                    in_post? 
                    <>
                        <h2>{post.title}</h2>
                        <p>{post.abbriv || post.content}</p>
                    </>:
                    <>
                        <a className="link-to-post" href={`community/post/${post.id}`}>
                        <h2>{post.title}</h2>
                        <p>{post.abbriv || post.content}</p>
                        </a>
                    </>
                }
                </div>

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
                            onClick={this.showCommentInput}></img>
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
                                onClick={this.deletePost}></img>:
                                <></>
                        }
                        </td>
                        <td style={{textAlign: 'right'}}>
                            <span>Posted at: {Utils.timeStampToTime(post.post_time)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {makeComment}

            </div>
        )
    }
}