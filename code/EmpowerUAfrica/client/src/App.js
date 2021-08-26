import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Index from './components/pages/index/index'; 
import Footer from './components/components/footer/footer'; 
import Header from './components/components/header/header'; 
import Navbar from './components/components/navbar/navbar';
import Signup from './components/pages/signup/signup';
import Signin from './components/pages/signin/signin'; 

import SetPassword from './components/pages/setting/setting_password'; 
import SetEmail from './components/pages/setting/setting_email'; 

import Community from './components/pages/community/community'; 
import PostContent from './components/pages/postContent/postContent';
import MakePost from './components/pages/makePost/makePost'; 


import Profile from './components/pages/profile/profile'; 
import StartToLearn from './components/pages/startToLearn/startToLearn';
import Video from './components/pages/video/video';
import MyCourses from './components/pages/myCourse/myCourse';
import CourseContent from './components/pages/courseContent/courseContent';
import CreateMaterial from './components/pages/createMaterial/createMaterial';
import AddCourse from './components/pages/addCourse/addCourse';
import SubmitAssignment from './components/pages/submitAssignment/submitAssignment';
import GradeAssignment from './components/pages/gradeAssignment/gradeAssignment';

import Calendar from './components/pages/calendar/calendar';

// import EditProfile from './components/pages/profile_edit/profile_edit'; 



export default function App() {
  return (
    <Router>
      <Header />
      <Navbar />
      <Switch>

        {/* Routing to the home page */}
        <Route exact path="/" key="home-page">
          <Index />
        </Route>

        {/* Routing to the signup page */}
        <Route exact path="/signup" key="signup-page">
          <Signup />
        </Route>

        {/* Routing to the signin page */}
        <Route exact path="/signin" key="signin-page">
          <Signin />
        </Route>

        {/* Routing to the setting password page */}
        <Route exact path="/setting_password" key="reset-pswd-page">
          <SetPassword />
        </Route>

        {/* Routing to the setting email page */}
        <Route exact path="/setting_email" key="reset-email-page">
          <SetEmail/>
        </Route>

        <Route exact path="/community" component={Community} key="community-page">
        </Route>

        <Route exact path="/community/post/:postId" component={PostContent} key="post-content-page">
        </Route>

        <Route exact path="/community/make_post" key="make-post-page">
          <MakePost/>
        </Route>

        <Route exact path="/community/:page" component={Community} key="community-page-n">
        </Route>

        <Route exact path="/profile/:username" component={Profile} key="user-profile">

        </Route>

        <Route exact path="/start_to_learn" key="start-to-learn">
          <StartToLearn/>
        </Route>

        <Route exact path="/start_to_learn/video" key="learning-video">
          <Video/>
        </Route>

        <Route exact path="/learning/my_courses" key="my-courses">
          <MyCourses/>
        </Route>

        <Route exact path="/learning/course/:course_name" component={CourseContent} key="course-content-page">
        </Route>

        <Route exact path="/courseModule/add_deliver" key="add-course-content">
          <CreateMaterial/>
        </Route>

        <Route exact path="/learning/create_course" key="add-course">
          <AddCourse/>
        </Route>

        <Route exact path="/calendar" key="calendar">
          <Calendar/>
        </Route>

        <Route exact path="/learning/edit_course/:course_name" key="edit-course" component={AddCourse}>     
        </Route>

        <Route exact path="/learning/submit_assignment/:id" key="submit_assignmen" component={SubmitAssignment}>
        </Route>

        <Route exact path="/learning/grade_assignment/:id" key="grade_assignment" component={GradeAssignment}>
        </Route>
        
      </Switch>
      <Footer />
    </Router>
    
  );
}