import React, { Component } from 'react'; 
import { UserAbstract, UserAbstractSmall } from '../userAbstract/userAbstract';
import CommentFooter from './commentFooter/commentFooter';
import './postReply.css';


export class Reply extends Component{
    state = {
        highlight: null, 
        highlightReplyTo: null,
        showAll: false
    }
    highlightReply = (highlight, highlightReplyTo) => {
        this.setState({highlight, highlightReplyTo}); 
    }
    render() {
        let reply = this.props.reply;
        let subReplies = reply.comments.map(
            comment => {
                let highlight = false; 
                if (comment.id === this.state.highlight) {
                    highlight = 'highlight'; 
                }
                else if (comment.id === this.state.highlightReplyTo) {
                    highlight = 'replyto'; 
                }
                return <ReplyToReply 
                    id={comment.id}
                    reply={comment} 
                    highlight={highlight} 
                    highlightReply={this.highlightReply}
                />
            }
        ); 
        return (
            <div className="post-reply" id={reply.id}>
                <div className="reply-content-block">
                    <UserAbstract user={reply.authorAbstract}/>
                    <p className="reply-body">{reply.content}</p>
                    <CommentFooter reply={reply}/>
                </div>
                <div className="subreplies-block">
                    {subReplies}
                </div>
            </div>
        )
    }
}
export class ReplyToReply extends Component {
    highlight = () => {
        const reply = this.props.reply; 
        this.props.highlightReply(reply.id, reply.reply_to); 
    }
    deHighlight = () => {
        this.props.highlightReply(null, null); 
    }
    render() {
        let reply = this.props.reply;
        let highlight = this.props.highlight; 
        let className = 'reply-to-reply'; 
        if (highlight === 'highlight') {
            className += ' reply-highlight';
        }
        else if (highlight === 'replyto') {
            className += ' reply-to-highlight'; 
        }
        
        return(
            <div className={className} onMouseEnter={this.highlight} onMouseLeave={this.deHighlight}>
                <div style={{display: "inline-flex"}}>
                    <UserAbstractSmall user={reply.authorAbstract}/ >
                    <p>
                        : {
                        reply.reply_to_obj !== null? 
                            <span>(Reply to @{reply.reply_to_obj.author})</span>:
                            <></>
                        } {reply.content}
                    </p>
                </div>
                <br />
                <CommentFooter reply={reply}/>
            </div>
        );
    }
}