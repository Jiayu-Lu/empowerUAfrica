import React, { Component} from 'react'; 
import './addCourse.css';

const createCourseURL = '/learning/createCourse'; 
const editCourseURL = '/learning/updateCourse';
const getCoursesURL = '/learning/getCourses';
const startToLearnURL = '/start_to_learn';
const deleteCourseURL = '/learning/deleteCourse'

/*
    This component is responsible for course creation, edit and deletion. 
*/
export default class addCourse extends Component{
    state = {
        error: null,
        mode: null,
        courseName: null,
        courseAbstract: null
    }
    discard = () => {
        if (!window.confirm('Discard current input? ')) {
            return; 
        }
        window.location.href = startToLearnURL;
    }
    submit = async () => {
        const name = document.getElementById('new-course-name').value;
        const instructor = document.getElementById('new-course-instructor').value;
        const description = document.getElementById('new-course-description').value;
        const { mode } = this.state; 
        let method, url, reqBody; 

        if (name.length === 0 || instructor.length === 0 || description.length === 0) {
            return; 
        }
        reqBody = {
            name,
            instructor,
            description
        }
        if (mode === 'create') {
            method = 'PUT';
            url = createCourseURL; 
        }
        else if (mode === 'edit') {
            method = 'POST';
            url = editCourseURL; 
            // Remove all unchanged properties from request body. 
            for (const key in reqBody) {
                if (this.state[key] === reqBody[key]) {
                    delete reqBody[key]; 
                }
            }
            // If nothing was changed, do not send the request. 
            if (Object.keys(reqBody).length === 0) {
                window.location.href = startToLearnURL;
                return; 
            }
        }
        else {
            return; 
        }

        let res;
        try {
            res = await fetch(
                url,
                {
                    method,
                    body: JSON.stringify(reqBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }
        catch (err) {
            console.error(err);
            alert('Internet Failure'); 
        }
        let body = await res.json(); 
        if (res.ok) {
            window.location.href = startToLearnURL;
        }
        else {
            this.setState({
                error: body.message
            })
        }
    }

    getCourseAbstract = async (courseName) => {
        let res; 
        try {
            res = await fetch(
                `${getCoursesURL}?name_equals=${courseName}`,
                {
                    method: 'GET'
                }
            )
        }
        catch (err) {
            console.error(err); 
            this.setState({error: 'Internet Failure'}); 
            return null; 
        }
        let body = await res.json();
        if (res.ok) {
            if (body.length === 0) {
                this.setState({
                    error: 'Course Not Found. '
                }); 
                return null; 
            }
            return body[0]; 
        }
        else {
            this.setState({
                error: body.message
            })
        }
    }


    deleteCourse = async () => {
        // Re-enter the course name to confirm. 
        const deletePrompt = 
        `
        All related modules and contents will be deleted!
        To proceed, type the course name below (case sensitive). 
        `;
        const userInputName = prompt(deletePrompt);
        if (userInputName !== this.state.courseName) {
            if (userInputName !== null) {
                // If the user did not click 'cancel' 
                alert('Incorrect course name.'); 
            }
            return; 
        }

        let res;
        try {
            res = await fetch(
                deleteCourseURL,
                {
                    method: 'DELETE',
                    body: JSON.stringify({
                        name: this.state.courseName
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert('Deleting course, please wait... '); 
        }
        catch (err) {
            console.error(err); 
            this.setState({
                error: 'Internet Failure'
            }); 
        }
        if (res.ok) {
            alert('Course successfully deleted. '); 
            window.location.href = startToLearnURL; 
        }
        else {
            let body; 
            console.log(res.headers.get('Content-Type'));
            if (res.headers.get('Content-Type').indexOf('application/json') !== -1) {
                body = await res.json(); 
                this.setState({
                    error: body.message
                })
            }
            if (res.status === 401) {
                // Login token outdated. 
                localStorage.setItem('signedIn', false);
                localStorage.setItem('username', null);
                localStorage.setItem('abstract', null);
            }
        }
    }

    async componentDidMount() {
        let mode;
        let courseName; 
        let courseAbstract; 
        if (this.props.match !== undefined) {
            mode = 'edit';
            courseName = this.props.match.params.course_name; 
            courseAbstract = await this.getCourseAbstract(courseName);
        } else {
            mode = 'create';
        }
        this.setState({mode, courseName, courseAbstract}); 
    }
 
    render() {

        let { mode, courseName, courseAbstract } = this.state; 
        if (mode === null) {
            return (<div className="page"></div>);
        }

        return (
            <div className="add_course page">
                <div className='add_course_form'>
                    <h1>
                        {
                            mode === 'create'? 
                                <>Create New Course</>:
                                <>Edit Course</>
                        }
                    </h1><br />
                    <span className="warningMsg">{this.state.error}</span>
                    <div>
                        <h2>Name</h2>
                        {
                            mode === 'create'? 
                            <input type='text' id="new-course-name"></input>:
                            <input type='text' id="new-course-name" value={courseName} disabled></input>
                        }
                        <br />
                        <span>
                            This will be used as the unique identifier of the course and cannot be changed later. 
                        </span>
                    </div>
                    <hr />
                    <div>
                        <h2>Instructor</h2>
                        <input 
                        type='text' 
                        id="new-course-instructor"
                        defaultValue={mode === 'create'? '': courseAbstract.instructor}></input><br />
                        <span>Username of the course instructor</span>
                    </div>
                    <hr />
                    <div>
                        <h2>Description</h2>
                        <textarea 
                        id="new-course-description"
                        defaultValue={mode === 'create'? '': courseAbstract.description}>

                        </textarea>
                    </div>

                    <div className="create-course-footer">
                        <table style={{width: '100%'}}>
                            <colgroup>
                                <col style={{width: '33%'}} key="discard"></col>
                                <col style={{width: '33%'}} key="delete"></col>
                                <col style={{width: '33%'}} key="submit"></col>
                            </colgroup>
                            <tbody>
                                <tr>
                                    <td>
                                        <button onClick={this.discard}>
                                            <h3>Discard</h3>
                                            <span className='add_course_mask'></span>
                                        </button>
                                    </td>
                                    <td style={{textAlign: 'center'}}>
                                        {
                                            mode === 'create'? 
                                                null:
                                                <button onClick={this.deleteCourse} className="delete-course-btn">
                                                    <h3>Delete Course</h3>
                                                    <span className='add_course_mask'></span>
                                                </button>
                                        }   
                                    </td>
                                    <td>
                                        <button onClick={this.submit} className="submit-change-btn">
                                            <h3>Submit</h3>
                                            <span className='add_course_mask'></span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            
            </div>
        )
        
    }
}