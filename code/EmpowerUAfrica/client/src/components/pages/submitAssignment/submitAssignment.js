import React, { Component } from 'react'; 
import { useParams } from 'react-router';
import Utils from '../../../utils';
import './submitAssignment.css';

const getDeliverableURL = "/deliverable/getDeliverable"; 
const getAllSubmissionsURL = "/deliverable/allSubmissionsOfDeliverableByUser"; 

export default class submitAssignment extends Component{
    state = {
        deliverable: null,
        submissions: null
    }
    submit = async () => {
        let content = document.getElementById('submission-content').value || ""; 
        const formdata = new FormData(); 
        const mediaFile = document.getElementById('submission-media').files[0]; 
        const { id: deliverableId } = this.props.match.params; 
        if (mediaFile !== undefined) {
            formdata.append('file', mediaFile);
        }
        let res, body; 
        content = encodeURIComponent(content); 
        const url = `/learning/createSubmission?content=${content}&deliverableId=${deliverableId}`;
        try {
            ({ res, body } = await Utils.ajax(
                url, 
                {
                    method: 'POST',
                    body: formdata
                }
            )); 
        }
        catch (err) {
            console.error(err);
            alert('Internet failure');
            return; 
        }
        if (!res.ok) {
            alert(body.message); 
        }
        else {
            window.location.reload(); 
        }
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
    getAllSubmissions = async () => {
        const { id: deliverableId } = this.props.match.params; 
        const username = localStorage.getItem('username'); 
        if (localStorage.getItem('signedIn') !== 'true' || username === 'null') {
            alert('Please sign in first. '); 
            window.history.back(); 
            return; 
        }
        const url = `${getAllSubmissionsURL}?deliverableId=${deliverableId}&targetUsername=${username}`; 
        let res, body; 
        try {
            ({res, body} = await Utils.ajax(
                url,
                {
                    method: 'GET'
                }
            ));
        }
        catch (err) {
            console.error(err); 
            alert('Internet failure'); 
        }
        if (!res.ok) {
            alert(body.message || body);
            return; 
        }
        return body; 
    }
    discard = () => {
        if (window.confirm('Disacrd all input? ')) {
            window.history.back();
        }
    }

    componentDidMount = async () => {
        const [ deliverable, submissions ] = await Promise.all([
            this.getDeliverableInfo(),
            this.getAllSubmissions()
        ]); 
        console.log(deliverable); 
        console.log(submissions); 
        this.setState({
            deliverable,
            submissions
        });
    }

    render() {
        const { deliverable, submissions } = this.state; 
        
        if (deliverable === null) {
            return null; 
        }
        let submissionsRow = submissions.map(
            submission => {
                let postedTimeStyle = {}; 
                if (submission.posted > deliverable.due) {
                    postedTimeStyle = {color: 'orangered'}
                }
                let grade = submission.grade < 0? '-': submission.grade; 
                let link = '-'; 
                if (submission.media !== "") {
                    link = <a href={submission.media} target="/">
                        Show in new tab
                    </a>
                }

                let row = (
                    <tr>
                        <td style={postedTimeStyle}>
                            {Utils.timeStampToAbstract(submission.posted)}
                        </td>
                        <td>
                            {submission.content}
                        </td>
                        <td>
                            {link}
                        </td>
                        <td>
                            {grade }
                        </td>
                        <td>
                            {submission.comment || "-"}
                        </td>    
                    </tr>
                )
                return row; 
            }
        ); 
        console.log(deliverable); 
        return (
            <div className="sumbit_assignment_page">
                <div className='sumbit_assignment_form'>
                    <h1>
                        {deliverable.title}
                    </h1>
                    <p>
                        {deliverable.description}
                    </p>
                    <hr />
                    <table className='submissions-table'>
                        <tr>
                            <th>Submitted At</th>
                            <th>Content</th>
                            <th>Media</th>
                            <th>Grade</th>
                            <th>Comment</th>
                        </tr>
                        {submissionsRow}
                    </table>
                    <table className='submit_file'>
                        <colgroup>
                            <col style={{width: '30%'}}></col>
                            <col style={{width: '70%'}}></col>
                        </colgroup>
                        <tbody>
                            <tr>
                                <td>
                                    <h3>Content</h3>
                                </td>
                                <td>
                                    <textarea style={{width:'100%', height:'5em', resize:'none'}} id="submission-content"></textarea>
                                </td>    
                            </tr>
                            <tr>
                                <td>
                                    <h3>Upload file to submit</h3>
                                </td>
                                <td>
                                    <input type="file" id="submission-media" accept=".txt,.pdf"></input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <button className="discard_assignment_btn cancel-btn" onClick={this.discard}>
                        <h3>Back</h3>
                        <span className='sumbit_assignment_btn_mask'></span>
                    </button>
                        
                    <button className="sumbit_assignment_btn confirm-btn" onClick={this.submit}>
                        <h3>Submit</h3>
                        <span className='sumbit_assignment_btn_mask'></span>
                    </button>
                </div>
            
            </div>
        )
    }
}