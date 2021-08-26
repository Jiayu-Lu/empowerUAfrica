import React, { Component} from 'react'; 
import './courseContent.css';
import CourseModule from '../../components/courseModule/courseModule';
import Utils from '../../../utils';

const getCourseContentURL = '/learning/getCourseContent'; 
const createModuleURL = '/learning/createModule'; 

export default class courseModule extends Component{

    state = {
        courseContent: null,
        newModule: false 
    }

    expandCreateModulePanel = () => {
        this.setState({
            newModule: true
        }); 
    }

    hideCreateModulePanel = () => {
        this.setState({
            newModule: false
        }); 
    }

    submitNewModule = async () => {
        let res, body; 
        const moduleName = document.getElementById('new-module-name').value; 
        if (moduleName.length === 0) {
            alert('Module name cannot be blank. '); 
            return; 
        }
        try {
            ({res, body} = await Utils.ajax(
                createModuleURL,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        courseName: this.state.courseContent.name, 
                        moduleName
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )); 
        }
        catch (err) {
            console.error(err); 
        }
        if (res.ok) {
            window.location.reload(); 
            return; 
        }
        else {
            console.log(body); 
            alert(body.message); 
        }
    }

    getCourseContent = async () => {
        const courseName = this.props.match.params.course_name; 
        // let courseContent = {
        //     "name": "Course Name", 
        //     "instructor": "Josiah",
        //     "description": "course description",
        //     "modules": [
        //         {
        //             "name": "First Week!", 
        //             "id": "Masdfajsdf", 
        //             "contents": [
        //                 {
        //                     "type": "reading",
        //                     "id": "R001",
        //                     "name": "lec01 reading",
        //                     "description": "Read this", 
        //                     "path": "https://cmsweb.utsc.utoronto.ca/cscc01s21/project/AfricanImpactChallenge.pdf" 
        //                 }, 
        //                 {
        //                     "type": "video", 
        //                     "id": "V001",
        //                     "name": "lec01 video" ,
        //                     "description": "Watch this If wandered relation no surprise of screened doubtful. Overcame no insisted ye of trifling husbands. Might am order hours on found. Or dissimilar companions friendship impossible at diminution. Did yourself carriage learning she man its replying. Sister piqued living her you enable mrs off spirit really. Parish oppose repair is me misery. Quick may saw style after money mrs. ", 
        //                     "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        //                 },
        //                 {
        //                     "type": "deliverable",
        //                     "id": "D001",
        //                     "name": "Assignment 1",
        //                     "description": "Do this", 
        //                     "due": 1626187198
        //                 }
        //             ]
        //         }
        //     ]
        // }
        // return courseContent;
        let res, body; 
        try {
            ( { res, body } = await Utils.ajax(
                `${getCourseContentURL}?courseName=${courseName}`,
                {
                    method: 'GET'
                }
            ));
        }
        catch (err) {
            console.error(err); 
            return; 
        }
        if (res.ok) {
            return body; 
        }
        else {
            if (res.status === 403 || res.status === 401) {
                alert(body.message); 
                window.history.back(); 
                return; 
            }
        }
    }

    async componentDidMount() {
        const courseContent = await this.getCourseContent(); 
        this.setState({
            courseContent
        });
    }

    render() {

        const { courseContent } = this.state; 
        if (courseContent === null) {
            return <></>
        }
        const view = courseContent.instructor === localStorage.getItem('username')? 
            'instructor': 'student'; 
        console.log(courseContent); 

        let modules = courseContent.modules.map( 
            courseModule => <CourseModule courseModule={courseModule} view={view} key={courseModule.id}/>
        )

        return (
            <div className="courseModule page">
                
                <div className="course_content_header">
                    <h1>
                        {courseContent.name}
                    </h1>
                    <hr />
                    <div>
                        <p>
                            Instructor: {courseContent.instructor}
                        </p>
                        <p>
                            {courseContent.description}
                        </p>
                    </div>
                </div>

                {
                    view === 'student' ? null :
                    <div className='courseModule_create_module'>
                        {
                            this.state.newModule === true?
                            <div className="new-module-info">
                                <table style={{width: '100%', textAlign: 'right'}}>
                                    <colgroup>
                                        <col style={{width: '70%'}}></col>
                                        <col style={{width: '15%'}}></col>
                                        <col style={{width: '15%'}}></col>
                                    </colgroup>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <input placeholder="Module Name" id="new-module-name"></input>
                                            </td>
                                            <td>
                                                <button 
                                                className="cancel-btn"
                                                onClick={this.hideCreateModulePanel}
                                                >
                                                    <h2>Discard</h2>
                                                </button>
                                            </td>
                                            <td>
                                                <button 
                                                className="confirm-btn"
                                                onClick={this.submitNewModule}
                                                >
                                                    <h2>Create</h2>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>  
                            </div>:
                            <div className='new-module-btn' onClick={this.expandCreateModulePanel}>
                                <h2> + New Module</h2>
                            </div>
                        }
                        
                    </div>
                }

                <div className='course_module'>
                    {modules}
                </div>
            
            </div>
        )
        
    }
}