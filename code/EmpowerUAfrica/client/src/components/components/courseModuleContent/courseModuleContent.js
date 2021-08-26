import React, { Component } from 'react'; 
import Utils from '../../../utils'; 
import CreateMaterial from '../../pages/createMaterial/createMaterial';
import './courseModuleContent.css';

/*
    props:
        - content
*/

const descAbbrivLen = 100; 
const deleteVideoURL = '/learning/deleteVideo';
const deleteDeliverableURL = '/learning/deleteDeliverable';
const deleteReadingURL = '/learning/deleteReading'; 
const editVideoURL = '/learning/editVideo';
const editReadingURL = '/learning/editReading';
const editDeliverableURL = '/learning/editDeliverable'; 

/**
 * 
 * @param {string} id    id of the content. 
 * @param {number} type  type of the content. 
 *    0: reading, 1: video, 2: deliverable
 * @returns 
 */
const deleteContent = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this content? ')) {
        return; 
    }
    let urls = [deleteReadingURL, deleteVideoURL, deleteDeliverableURL];
    let url = urls[type]; 
    if (url === undefined) {
        return; 
    }

    let res, body; 
    try {
        ({ res, body } = await Utils.ajax(
            url,
            {
                method: 'DELETE',
                body: JSON.stringify({
                    id
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )); 
    }
    catch(err) {
        console.error(err); 
        alert('Internet Failure'); 
        return; 
    }
    if (!res.ok) {
        alert(body.message); 
        console.log(body); 
    }
    else {
        window.location.reload(); 
    }
}

export class Reading extends Component {

    state = {
        expand: false,
        edit: false
    }

    toggleExpand = () => {
        if (this.state.edit) {
            return; 
        }
        this.setState({
            expand: !this.state.expand
        }); 
    }

    openEdit = () => {
        this.setState({
            expand: false,
            edit: true
        }); 
    }
    discardEdit = () => {
        this.setState({
            edit: false
        }); 
    }

    render() {
        const { content: reading, view } = this.props; 
        const { expand, edit } = this.state; 
        return (
            <div className="course-module-content">
                <div onClick={this.toggleExpand} style={{cursor: 'pointer'}}>
                    <h3 className="course-module-content-name">{reading.name}
                    {
                        view === 'instructor'? 
                        <><img 
                            alt="edit" 
                            className="icon" 
                            src="/icons/edit.png" 
                            onClick={(event) => {this.openEdit(); event.stopPropagation()}}>
                        </img>
                        <img 
                            alt="delete" 
                            className="icon" 
                            src="/icons/garbage.png" 
                            onClick={(event) => {deleteContent(reading.id, 0); event.stopPropagation()}}>
                        </img></>: null
                    }
                    
                    <button  className="toggle-expand-btn">
                        <div className={expand===true? 'triangle-left': 'triangle-down'}>
                            
                        </div>
                    </button>
                    <button onClick={(e) => {window.open(this.props.content.path); e.stopPropagation()}}>Open in new window</button>
                    </h3>
                    {
                        expand === true? 
                        <p className="course-content-full-description">{reading.description}</p>:
                        <span>{Utils.trimString(reading.description, descAbbrivLen)}</span>
                    }
                </div>
                <br />
                <div class="video-wrapper">
                {
                    expand === true? 
                    <iframe className="embedded-file-window" src={reading.path} title="embedded file browser" frameborder="0"></iframe>:
                    null
                }
                </div>
                {
                    edit === true? 
                    <EditMaterial content={reading} type='reading' collapse={this.discardEdit}/>: null
                }
            </div>
        ); 
    }
}

export class Video extends Component {
    state = {
        expand: false
    }

    toggleExpand = () => {
        if (this.state.edit) {
            return; 
        }
        this.setState({
            expand: !this.state.expand
        }); 
    }

    openEdit = () => {
        this.setState({
            expand: false,
            edit: true
        }); 
    }
    discardEdit = () => {
        this.setState({
            edit: false
        }); 
    }

    openVideoInNewWindow = () => {
        window.open(`https://www.youtube.com/watch?v=${this.props.content.vid}`); 
    }

    render() {
        const { content: video, view } = this.props;
        const { expand, edit } = this.state; 
        const { source, vid } = video; 
        let embeddedVideo; 
        if (source === 'YouTube') {
            embeddedVideo = <iframe className="embedded-video"  src={`https://www.youtube.com/embed/${vid}`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        }
        return (
            <div className="course-module-content">
                <div onClick={this.toggleExpand} style={{cursor: 'pointer'}}>
                    <h3 className="course-module-content-name">{video.name}
                    {
                        view === 'instructor'? 
                        <><img 
                            alt="edit" 
                            className="icon" 
                            src="/icons/edit.png" 
                            onClick={(event) => {this.openEdit(); event.stopPropagation()}}>
                        </img>
                        <img 
                            alt="delete" 
                            className="icon" 
                            src="/icons/garbage.png" 
                            onClick={(event) => {deleteContent(video.id, 1); event.stopPropagation()}}>
                        </img></>: null
                    }
                    <button  className="toggle-expand-btn">
                        <div className={expand===true? 'triangle-left': 'triangle-down'}>

                        </div>
                    </button>
                    <button onClick={(e) => {this.openVideoInNewWindow(); e.stopPropagation()}}>Open in new window</button>
                    </h3>
                    {
                        expand === true? 
                        <p className="course-content-full-description">{video.description}</p>:
                        <span>{Utils.trimString(video.description, descAbbrivLen)}</span>
                    }
                </div>
                <br />
                <div class="video-wrapper">
                {
                    expand === true? 
                    embeddedVideo:
                    null
                }
                </div>
                {
                    edit === true? 
                    <EditMaterial content={video} type='video' collapse={this.discardEdit}/>: null
                }
            </div>
        )
    }
}

export class Deliverable extends Component {
    state = {
        edit: false
    }

    openEdit = () => {
        this.setState({
            edit: true
        }); 
    }
    discardEdit = () => {
        this.setState({
            edit: false
        }); 
    }

    clickDeliverable = () => {
        if (this.state.edit === true) {
            return; 
        }
        const {view, content: deliverable} = this.props;
        if (view === "instructor") {
            window.location.href = `/learning/grade_assignment/${deliverable.id}`; 
        }
        else {
            window.location.href = `/learning/submit_assignment/${deliverable.id}`; 
        }
    }

    render() {
        const { content: deliverable, view } = this.props; 
        const { edit } = this.state; 
        let overdue, dueTimeString; 
        console.log(deliverable); 
        if (deliverable.due < 0) {
            dueTimeString = 'No due time specified'
            overdue = false; 
        }
        else {
            dueTimeString = `Due ${Utils.timeStampToTime(deliverable.due)}`;
            overdue = Math.round(Date.now() / 1000) > deliverable.due && !deliverable.submitted;
        }
        return (
            <div className="course-module-content" onClick={this.clickDeliverable}>
                <h3 className="course-module-content-name">{deliverable.name}
                {
                        view === 'instructor'? 
                        <><img 
                            alt="edit" 
                            className="icon" 
                            src="/icons/edit.png" 
                            onClick={(event) => {this.openEdit(); event.stopPropagation()}}>
                        </img>
                        <img 
                            alt="delete" 
                            className="icon" 
                            src="/icons/garbage.png" 
                            onClick={(event) => {deleteContent(deliverable.id, 2); event.stopPropagation()}}>
                        </img></>: null
                    }
                </h3>
                <span>{Utils.trimString(deliverable.description,descAbbrivLen)}</span><br />
                {

                    overdue === true? 
                    <span className="overdue">{dueTimeString}</span>:
                    <span>{dueTimeString}</span>
                }
                {
                    edit === true? 
                    <EditMaterial content={deliverable} type='deliverable' collapse={this.discardEdit}/>: null
                }
            </div>
        )
    }
}

class EditMaterial extends Component {

    discard = () => {
        if (!window.confirm('Discard all changes? ')) {
            return; 
        }
        this.props.collapse(); 
    }
    submit = async () => {
        const { type, content } = this.props; 
        let url, reqBody; 

        const name = document.getElementById(`${content.id}-new-content-name`).value; 
        const description = document.getElementById(`${content.id}-new-content-description`).value;
        if (name.length === 0 || description.length === 0) {
            alert('Name and description cannot be blank. ');
            return; 
        } 
        reqBody = {
            id: content.id,
            name,
            description
        }
        switch (type) {
            case 'reading': 
                url = editReadingURL;
                break; 
            case 'video':
                url = editVideoURL;
                const link = document.getElementById(`${content.id}-new-video-link`).value;
                const vid = Utils.getY2bVideoId(link); 
                if (vid === null) {
                    alert('Invalid YouTube link. ');
                    return; 
                }
                reqBody.vid = vid; 
                break; 
            case 'deliverable':
                url = editDeliverableURL; 
                const dueTimeString = document.getElementById(`${content.id}-new-deliverable-due`).value;
                const maxPointsStr = document.getElementById(`${content.id}-new-deliverable-maxpts`).value;
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
                reqBody.dueTimestamp = dueTimestamp; 
                reqBody.totalPoints = maxPoints; 
                break; 
            default: return; 
        }

        let res, body; 
        try {
            ({ res, body } = await Utils.ajax(
                url,
                {
                    method: 'POST',
                    body: JSON.stringify(reqBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ))
        }
        catch (err) {
            console.error(err);
            alert('Internet failure');
            return; 
        }

        if (!res.ok) {
            alert(body.message);
            console.log(body.message); 
            return; 
        }
        else {
            window.location.reload(); 
        }
    }

    render() {
        const { content, type } = this.props; 
        let contentUpload = null;
        
        switch (type) {
            case 'reading': 
                contentUpload =
                <>
                    {/* <h2>Reading file: </h2>
                    <input type="file" id={`${id}-new-reading-file`}></input> */}
                </>;
                break;
            case 'video':
                contentUpload =
                <>
                    <h2>YouTube link: </h2>
                    <input type="text" id={`${content.id}-new-video-link`} defaultValue={`https://www.youtube.com/watch?v=${content.vid}`}></input>
                </>;
                break;
            case 'deliverable':
                const defaultDueTime = content.due < 0? '': Utils.timeStampToLocalDatetime(content.due); 
                contentUpload = <>  
                    <div>
                        <h2>Max points</h2>
                        <input type="text" id={`${content.id}-new-deliverable-maxpts`} defaultValue={content.totalPoints}></input><br />
                    </div>
                    <div style={{marginTop: '.4em'}}>
                        <h2>Deadline: </h2>
                        <input type="datetime-local" id={`${content.id}-new-deliverable-due`} defaultValue={defaultDueTime}></input>
                        {/* TODO: Change this to date and time, since firefox does not support datetime-local*/}
                    </div>
                </>;
                break;
            default: 
                contentUpload = null;
        }

        return (
            <div className="addDeliver">
                
                <div>
                    <h2>Name</h2>
                    <input type='text' id={`${content.id}-new-content-name`} defaultValue={content.name}></input>
                </div>

                <div style={{marginTop: '.7em'}}>
                    <h2>Description</h2>
                </div>
                <div>
                    <div>
                        <textarea className="new-content-description" id={`${content.id}-new-content-description`} defaultValue={content.description}>

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