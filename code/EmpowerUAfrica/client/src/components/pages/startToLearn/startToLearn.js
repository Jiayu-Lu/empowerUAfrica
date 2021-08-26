import React, { Component} from 'react'; 
import './startToLearn.css';
import CourseOverview from '../../components/courseOverview/courseOverview';
import Utils from '../../../utils'; 


const getAllCoursesURL = '/learning/getCourses'

export default class startToLearn extends Component{
    state = {

    }
    getAllCourses = async () => {
        let courses; 

        let res; 
        try {
            res = await fetch(
                getAllCoursesURL,
                {
                    method: 'GET'
                }
            )
        }
        catch (err) {
            console.error(err); 
            alert('Internet Failure: Failed to connect to server.');
        }
        courses = await res.json(); 
        console.dir(courses); 
        return courses; 
    
    }
    async componentDidMount() {
        const courses = await this.getAllCourses(); 
        this.setState({
            courses
        });
    }

    render() {
        if (this.state.courses === undefined) {
            return <></>
        }
        let courses = this.state.courses.map(course => <CourseOverview course={course} key={course.name}/>);
        const isAdmin = Utils.isAdmin(); 
        return (
            <div className="start_to_learn">
                
                <div>
                    <h2>
                        All Courses
                    </h2>
                    <a href='/learning/my_courses'>
                        See my courses
                    </a>

                    {
                        isAdmin? 
                        <a href='/learning/create_course' style={{marginLeft: '2em'}}>
                            Create Course
                        </a>:
                        <></>
                    }
                    
                </div>

                <div className='course_enrol clearfix'>
                    {courses}
                </div>
            
            </div>
        )
        
    }
}