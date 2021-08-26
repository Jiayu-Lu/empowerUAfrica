import React, { Component} from 'react'; 
import Utils from '../../../utils';
import './courseOverview.css';

const editCourseURL = '/learning/edit_course'; 
const enrollCourseURL = '/learning/enrollCourse';
const dropCourseURL = '/learning/dropCourse'; 

export default class courseOverview extends Component{

    state = {
        error: null, 
        course: null,
        enrolled: null,
        processingRequest: false
    }

    updateEnrollStatus = async (enrol) => {
        let res, body; 
        let url; 

        if (enrol === true) {
            url = enrollCourseURL;
        }
        else {
            url = dropCourseURL;
        }

        try {
            ({res, body} = await Utils.ajax(
                url,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        courseName: this.props.course.name
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )); 
        }
        catch (err) {
            console.error(err); 
            alert('Internet Failure. '); 
        }
        if (res.ok) {
            this.setState({
                enrolled: enrol === true
            }); 
        }
        else {
            alert(body.message); 
            console.log(body); 
        }
    }

    enrol = () => {
        this.updateEnrollStatus(true); 
    }

    drop = () => {
        this.updateEnrollStatus(false); 
    }

    gotoCoursePage = () => {
        let { enrolled } = this.state; 
        if (enrolled !== true && !Utils.isAdmin()) {
            alert('Please enroll first. '); 
            return; 
        }
        let courseURL = '/learning/course/' + this.props.course.name; 
        window.location.href = courseURL;
    }

    gotoEditPage = (event) => {
        let url = `${editCourseURL}/${this.props.course.name}`;
        window.location.href = url; 
        event.stopPropagation(); 
    }

    componentDidMount() {
        let course = this.props.course; 
        let enrolled  = course.enrolled === true; 
        delete course.enrolled; 
        this.setState({
            course,
            enrolled
        }); 
    }

    render() {
        const { course, enrolled, processingRequest } = this.state; 
        if (course === null ){
            return null; 
        }
        const isAdmin = Utils.isAdmin(); 

        return (
            <div className="courseOverview" onClick={this.gotoCoursePage}>
                
                <div>
                    <h3>{course.name || '(No Name)'}</h3>
                    {
                        enrolled === true?
                            <button
                            onClick={(event)=>{this.drop(); event.stopPropagation();}}
                            className="drop-btn"
                            >Drop
                            </button>:
                            <button 
                            onClick={(event)=>{this.enrol(); event.stopPropagation();}}
                            className="enrol-btn"
                            >Enrol
                            </button>
                    }
                    {
                        isAdmin === true? 
                            <button
                            className="drop-btn"
                            onClick={this.gotoEditPage}>
                                Edit
                            </button>:
                            null
                    } 
                </div>
                <p>Instructor: {course.instructor || '(No instructor)'}</p>
                <p>{course.description || '(No description)'}</p>
                {/* <span className='mask'></span> */}
                {/* This mask is covering the buttons.  */}
            </div>
        )
        
    }
}