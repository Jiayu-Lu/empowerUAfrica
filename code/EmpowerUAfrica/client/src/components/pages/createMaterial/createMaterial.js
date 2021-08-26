import React, { Component} from 'react'; 
import './createMaterial.css';
import Utils from '../../../utils';

const supportedReadingFormat = ['txt', 'md', 'pdf'];
const createVideoURL = '/learning/createVideo'; 
const createDeliverableURL = '/learning/createDeliverable'; 
const createReadingURL = '/learning/createReading'; 

export default class CreateMaterial extends Component{
    state = {
        type: 'reading'
    }

    setInputType = () => {
        const { id: moduleId } = this.props.module; 
        const newType = document.getElementById(`${moduleId}-new-content-type`).value; 
        this.setState({type: newType}); 
    }

    discard = () => {
        if (!window.confirm('Discard all changes? ')) {
            return; 
        }
        this.props.collapse(); 
    }
    submit = async () => {
        const { id: moduleId } = this.props.module; 
        let name = document.getElementById(`${moduleId}-new-content-name`).value; 
        let description = document.getElementById(`${moduleId}-new-content-description`).value; 
        const type = document.getElementById(`${moduleId}-new-content-type`).value; 
        let newContent = {
            name,
            description,
            moduleId
        }; 
        let url; 
        let formdata;
        switch (type) {
            case 'video': 
                url = createVideoURL; 
                const videoURL = document.getElementById(`${moduleId}-new-video-link`).value; 
                const vid = Utils.getY2bVideoId(videoURL); 
                if (vid === null) {
                    alert('Invalid YouTube video link. '); 
                    return; 
                }
                newContent.vid = vid; 
                break; 
            case 'deliverable':
                url = createDeliverableURL; 
                const dueTimeString = document.getElementById(`${moduleId}-new-deliverable-due`).value;
                const maxPointsStr = document.getElementById(`${moduleId}-new-deliverable-maxpts`).value;
                const maxPoints = parseFloat(maxPointsStr); 
                let dueTimestamp; 
                if (isNaN(maxPoints)) {
                    alert('Max points should be a number. '); 
                    return;
                }
                if (dueTimeString.length === 0) {
                    dueTimestamp = -1;
                }
                else {
                    dueTimestamp = Math.round( Date.parse(dueTimeString) / 1000); 
                }
                newContent.dueTimestamp = dueTimestamp; 
                newContent.totalPoints = maxPoints; 
                break; 
            case 'reading':
                name = encodeURIComponent(name);
                description = encodeURIComponent(description); 
                url = `${createReadingURL}?name=${name}&description=${description}&moduleId=${moduleId}`; 
                const readingFile = document.getElementById(`${moduleId}-new-reading-file`).files[0];
                console.log(readingFile); 
                formdata = new FormData(); 
                if (readingFile === undefined) {
                    alert('Please select a file. '); 
                    return; 
                }
                
                formdata.append('file', readingFile); 
                break; 
            default: return;
        }

        let res, body; 
        try {
            ({ res, body } = await Utils.ajax(
                url, 
                {
                    method: 'PUT',
                    body: type === 'reading'? formdata: JSON.stringify(newContent),
                    headers: type === 'reading'? undefined: {
                        'Content-Type': 'application/json'
                    }
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
            return;
        }
    }

    render() {
        const { type } = this.state; 
        const { id: moduleId } = this.props.module; 
        let contentUpload = null;
        
        switch (type) {
            case 'reading': 
                contentUpload =
                <>
                    <h2>Reading file: </h2>
                    <input type="file" id={`${moduleId}-new-reading-file`}></input>
                </>;
                break;
            case 'video':
                contentUpload =
                <>
                    <h2>YouTube link: </h2>
                    <input type="text" id={`${moduleId}-new-video-link`}></input>
                </>;
                break;
            case 'deliverable':
                contentUpload =
                <>  
                    <div>
                        <h2>Max points</h2>
                        <input type="text" id={`${moduleId}-new-deliverable-maxpts`}></input><br />
                    </div>
                    <div style={{marginTop: '.4em'}}>
                        <h2>Deadline: </h2>
                        <input type="datetime-local" id={`${moduleId}-new-deliverable-due`} className="new-deliverable-due"></input>
                        {/* TODO: Change this to date and time, since firefox does not support datetime-local*/}
                    </div>
                </>;
                break;
            default: 
                contentUpload =  <></>;
        }

        return (
            <div className="addDeliver">
                
                <div>
                    <h2>Name</h2>
                    <input type='text' id={`${moduleId}-new-content-name`}></input>
                </div>

                <div style={{marginTop: '.7em'}}>
                    <h2>Type</h2>
                    <select onInput={this.setInputType} id={`${moduleId}-new-content-type`}>
                        <option key="reading" value="reading">Reading</option>
                        <option key="video" value="video">YouTube Video</option>
                        <option key="deliverable" value="deliverable">Deliverable</option>
                    </select>
                </div>

                <div style={{marginTop: '.7em'}}>
                    <h2>Description</h2>
                </div>
                <div>
                    <div>
                        <textarea id={`${moduleId}-new-content-description`}>

                        </textarea>     
                    </div>
                </div><br />
                
                <div className="create-material-content">
                    {contentUpload}
                </div><br />

                <div className="create-material-footer">

                    <button
                    className='cancel-btn' onClick={this.discard}>Discard</button>

                    <button 
                    id='create-material-submit-btn' 
                    className='confirm-btn' onClick={this.submit}>Submit</button>
                </div>
            </div>
        )
    }
}