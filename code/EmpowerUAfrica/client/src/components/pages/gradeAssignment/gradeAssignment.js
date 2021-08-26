import React, { Component } from 'react'; 
import Utils from '../../../utils';
import './gradeAssignment.css';
import AssignmentSubmission from '../../components/assignmentSubmission/assignmentSubmission';

const getDeliverableURL = "/deliverable/getDeliverable"; 
const getSubmissionsURL = "/deliverable/getSubmissions"; 

export default class gradeAssignment extends Component{

    state = {
        id: null,
        submissions: null,
        deliverable: null, 
        showLate: false,
        showOnlyLatest: true,
        focusOn: null,
        hasInput: false
    }

    setShowLate = () => {
        this.setState({
            showLate: document.getElementById('show-late').checked
        })
    }
    setOnlyShowLatest = () => {
        this.setState({
            showOnlyLatest: document.getElementById('show-only-latest').checked
        })
    }


    getDeliverableInfo = async () => {
        let res, body; 
        const { id } = this.props.match.params; 
        const url = `${getDeliverableURL}?id=${id}`; 
        try {
            ({ res, body} = await Utils.ajax(
                url,
                {
                    method: 'GET'
                }
            ))
        }
        catch (err) {
            console.error(err); 
            alert("Internet failure"); 
            return null; 
        }
        if (!res.ok) {
            console.error(body.message); 
            alert(body.message); 
            return null
        }
        else {
            return body; 
        }
    }

    getSubmissions = async () => {
        let res, body; 
        const { id } = this.props.match.params; 
        const url = `${getSubmissionsURL}?id=${id}`; 
        try {
            ({ res, body} = await Utils.ajax(
                url,
                {
                    method: 'GET'
                }
            ))
        }
        catch (err) {
            console.error(err); 
            alert("Internet failure"); 
            return null; 
        }
        if (!res.ok) {
            console.error(body.message); 
            alert(body.message); 
            return null
        }
        else {
            return body; 
        }
    }

    filterVisibleSubmissions = (submissions, showLate, showOnlyLatest) => {
        let visibleSubmissions = []; 
        let allSubmissions = [...submissions.onTime]; 

        if (showLate) {
            allSubmissions = [...allSubmissions, ...submissions.late]; 
        }

        if (showOnlyLatest) {
            // Leave only latest submission of a user
            let usernameToLatestSubmission = {}; 
            // username -> its latest submission (so far)
            for (const submission of allSubmissions) {
                const username = submission.username; 
                if ( !(username in usernameToLatestSubmission)) {
                    usernameToLatestSubmission[username] = submission; 
                }
                else {
                    if (usernameToLatestSubmission[username].posted < submission.posted) {
                        usernameToLatestSubmission[username] = submission; 
                    }
                }
            }
            
            // Collect every user's latest submission into visibleSubmission 
            for (const username in usernameToLatestSubmission) {
                visibleSubmissions.push(usernameToLatestSubmission[username]); 
            }
        }
        else {
            visibleSubmissions = allSubmissions; 
        }
        visibleSubmissions.sort( (a, b) => a.posted - b.posted ); 
        return visibleSubmissions; 
    }

    switchStudent = (submission) => {
        if (this.state.hasInput && !window.confirm("Discard current input? ")) {
            return; 
        }
        this.setState({
            focusOn: submission,
            hasInput: false
        }); 
        let defaultGrade = submission.grade || -1;
        if (defaultGrade === -1) {
            defaultGrade = 0; 
        }
        document.getElementById('grade_score').value = defaultGrade;
        document.getElementById('grade_comment').value = submission.comment || "";
    }
    
    switchToPrevious = () => {
        let { focusOn, submissions, showLate, showOnlyLatest } = this.state; 
        const visibleSubmissions = this.filterVisibleSubmissions(submissions, showLate, showOnlyLatest);
        // Get the submission that is the least prior to the current focused submission
        let prev = null;
        console.log(visibleSubmissions); 
        for (const submission of visibleSubmissions) {
            if (submission.posted > focusOn.posted || 
                ((submission.posted === focusOn.posted) && (submission.submissionId === focusOn.submissionId))) {
                break; 
            }
            prev = submission; 
        }
        if (prev === null) {
            alert("This is the first submission! "); 
            return; 
        }
        this.switchStudent(prev); 
    }
    switchToNext = () => {
        let { focusOn, submissions, showLate, showOnlyLatest } = this.state; 
        const visibleSubmissions = this.filterVisibleSubmissions(submissions, showLate, showOnlyLatest);
        // Get the submission that is the least recent than the current focused submission
        let next = null; 
        console.dir(focusOn); 
        for (const submission of visibleSubmissions) {
            if (submission.posted > focusOn.posted ||
                 ((submission.posted === focusOn.posted) && (submission.submissionId !== focusOn.submissionId))) {
                next = submission; 
                break; 
            }
        }
        if (next === null) {
            alert("This is the last submission! "); 
            return; 
        }
        this.switchStudent(next); 
    }
    makeChange = () => {
        this.setState({
            hasInput: true
        }); 
    }
    updateSubmission = async (submissionId, grade, comment) => {
        const submissions = this.state.submissions; 
        let newSubmissions = JSON.parse(JSON.stringify(submissions)); // Deep copy
        let targetSubmission = 
            newSubmissions.late.filter(submission => submission.id === submissionId)[0] ||
            newSubmissions.onTime.filter(submission => submission.id === submissionId)[0];
        if (targetSubmission === undefined) {
            console.error(`No such submission: id= ${submissionId}`);
        }
        targetSubmission.grade = grade;
        targetSubmission.comment = comment; 
        this.setState(
            {
                submissions: newSubmissions,
                hasInput: false
            }
        ); 
    }
    getControlFunc = () => {
        const {switchToNext, switchToPrevious, makeChange, updateSubmission} = this; 
        return {
            switchToNext, 
            switchToPrevious,
            makeChange,
            updateSubmission
        }
    }

    renderSwitchStudent() {
        const { submissions, deliverable, showLate, showOnlyLatest } = this.state;

        let visibleSubmissions = this.filterVisibleSubmissions(submissions, showLate, showOnlyLatest); 
        const { focusOn } = this.state; 
        let students = visibleSubmissions.map(
            (submission) => {
                let className = ['switch_student_single']; 
                if (submission.posted > deliverable.due) {
                    className.push('late'); 
                }
                if (submission.grade === undefined || submission.grade === null || submission.grade === -1) {
                    className.push('ungraded'); 
                }
                if (focusOn.id === submission.id) {
                    className.push('focused'); 
                }
                className = className.join(' '); 
                return <div className={className} onClick={() => {this.switchStudent(submission)}}>
                    {submission.username}<br />
                    <small>{Utils.timeStampToTime(submission.posted)}</small>
                </div>
            }
        );
        return students; 

    }

    componentDidMount = async () => {
        // Get deliverable id from url
        const { id } = this.props.match; 
        const [ submissions, deliverable ] = await Promise.all([this.getSubmissions(), this.getDeliverableInfo()]); 
        console.dir(submissions);
        this.setState({
            id,
            submissions,
            deliverable,
            focusOn: submissions.onTime[0] || submissions.late[0] || null 
        }); 
    }

    render() {
        
        const {deliverable, submissions} = this.state;
        if (deliverable === null) {
            return null; 
        }
        let students = this.renderSwitchStudent(); 
        const focusedSubmission = this.state.focusOn;

        return (
            <div className="grade_assignment_page">
                <div className='grade_assignment_form'>
                    <div className="grad-deliverable-info">
                        <h1>{deliverable.title}</h1>
                        <div className="grade-deliverable-description">
                            <p>{deliverable.description}</p>
                        </div>
                        <h3>Due: {Utils.timeStampToTime(deliverable.due)}</h3>
                        <hr />
                    </div>
                    <div>
                        <h1>Submssions</h1>
                        <p style={{fontSize: '1.1em'}}></p>
                        <p style={{fontSize: '1.1em'}}>
                            <span><input onInput={this.setShowLate} type="checkbox" id="show-late"></input>Show late submissions</span><br />
                            <span><input onInput={this.setOnlyShowLatest} type="checkbox" id="show-only-latest" defaultChecked={true}></input>Show only latest submission</span>
                        </p>
                        <div className='switch_student'>
                            {students}
                        </div>
                    </div>

                    <div>
                        {
                            (submissions.late.length + submissions.onTime.length) > 0? 
                            <AssignmentSubmission submission={focusedSubmission} deliverable={deliverable} getControlFunc={this.getControlFunc}/>
                            : null
                        }
                    </div>
                    
                </div>
            </div>
        )
    }
}
