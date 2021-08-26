import React, { Component } from 'react'; 
import Utils from '../../../utils';
import './assignmentSubmission.css';

const sendFeedbackURL = "/deliverable/sendFeedback"; 

/**
 *  @prop {object} submission: holds all the information of the submission. 
 *  @prop {object} deliverable: holdsa all the information of the deliverable. 
 */
export default class AssignmentSubmission extends Component{

    state = {
        grade: null,
        comment: null,
        submission: null
    }

    discard = () => {
        if (window.confirm('Discard all input? ')) {
            let defaultGrade = this.props.submission.grade || -1;
            let defaultComment = this.props.submission.comment || ""; 
            if (defaultGrade < 0) {
                defaultGrade = 0; 
            }
            document.getElementById('grade_score').value = defaultGrade;
            document.getElementById('grade_comment').value = defaultComment; 
        }
    }

    sendFeedback = async () => {
        let res, body; 
        const grade = document.getElementById('grade_score').value;
        const comment = document.getElementById('grade_comment').value; 
        const id = this.props.submission.id; 
        const totalPoints = this.props.deliverable.totalPoints; 
        if (isNaN(parseFloat(grade)) || grade < 0 || grade > totalPoints) {
            alert(`Grade not in valid range [0, ${totalPoints}]`); 
            return false; 
        }
        try {
            ({ res, body } = await Utils.ajax(
                sendFeedbackURL,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        submissionId: id,
                        grade,
                        comments: comment 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ))
        }
        catch (err) {
            console.error(err);
            alert("Internet failure"); 
        }
        if (!res.ok) {
            alert(body.message || body); 
            return false; 
        }
        else {
            this.props.getControlFunc().updateSubmission(id, grade, comment); 
            return true; 
        }
    }

    submitAndSwitchToNext = async () => {
        if (await this.sendFeedback()) {
            this.props.getControlFunc().switchToNext(); 
        }
    }


    componentDidMount = () => {
        this.setState({
            submission: this.props.submission
        }); 
    }

    render() {

        const {submission, deliverable, getControlFunc} = this.props; 
        const controlFuncs = getControlFunc(); 

        return (
            <div className="assignmentSubmission_component">
                {
                    submission.media !== "" ? 
                    <>
                        <iframe id="embedded_file_window" src={submission.media} title="embedded file browser"></iframe>
                        <span></span>
                        <br />
                        
                        <div className="submission-content-p">
                            <p>{submission.content}</p>
                        </div>
                    </>:
                    <div className="submission-content-p" style={{height: '67vh'}}>
                        <p>{submission.content}</p>
                    </div>
                }
                <div>
                <table className='grade_section'>
                    <colgroup>
                        <col style={{width: '15%'}}></col>
                        <col style={{width: '60%'}}></col>
                        <col style={{width: '25%'}}></col>
                    </colgroup>
                    <tbody>
                        <tr>
                            <td>
                                <h3 style={{alignItems: 'top'}}>Score</h3>
                            </td>
                            <td>
                                <input id="grade_score" type='number' max={deliverable.totalPoints} onChange={controlFuncs.makeChange}>
                                </input>
                                <span> / {deliverable.totalPoints}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h3>Comment</h3>
                            </td>
                            <td>
                                <textarea id="grade_comment" onChange={controlFuncs.makeChange}></textarea>
                            </td>
                            <td className="grading-buttons">
                                <button onClick={controlFuncs.switchToPrevious}>Previous Submission</button>
                                <button onClick={this.sendFeedback}>Submit Feedback</button>
                                <button onClick={this.submitAndSwitchToNext}>Submit and Move to Next</button>
                                <button onClick={controlFuncs.switchToNext}>Next Submission</button>
                                <button onClick={this.discard}>Discard Feedback</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>
        )
    }
}