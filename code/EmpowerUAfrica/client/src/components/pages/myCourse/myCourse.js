import React, { Component} from 'react'; 
import './myCourse.css';
import CourseOverview from '../../components/courseOverview/courseOverview';
import Utils from '../../../utils';

const searchCourseURL = '/learning/getCourses'

export default class MyCourses extends Component{
    state = {

    }
    getMyCourses = async () => {
        // TODO: ajax
        let res, body; 

        try {
            ({ res, body } = await Utils.ajax(
                `${searchCourseURL}?enrolled_by=${localStorage.getItem('username')}`,
                {
                    method: 'GET'
                }
            )); 
        }
        catch (err) {
            console.error(err);
            alert('Internet failure. '); 
        }
        if (!res.ok) {
            alert(body.message); 
            window.history.back(); 
            return; 
        }

        return body; 
    }
    async componentDidMount() {
        const courses = await this.getMyCourses();
        this.setState({
            courses
        }); 

    }

    render() {
        if (localStorage.getItem('signedIn') !== 'true') {
            window.history.back(); 
            return null; 
        }
        if (this.state.courses === undefined) {
            return null; 
        }
        let courses = this.state.courses.map(course => <CourseOverview course={course} key={course.name}/>);

        return (
            <div className="myCourse">
                
                <div>
                    <h2>
                        My Courses
                    </h2>
                    <a href='/start_to_learn'>
                        See all courses
                    </a>
                </div>
                

                <div className='course_enrol clearfix'>
                    {courses}
                </div>
            
            </div>
        )
        
    }
}