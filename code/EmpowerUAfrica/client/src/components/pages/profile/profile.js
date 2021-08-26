import React, { Component } from 'react'; 
import Loading from '../../components/loading/loading'; 
import Tag from '../../components/tag/tag';
import Utils from '../../../utils';
import "./profile.css"


export default class profile extends Component {

  userTypes = ['Individual', 'Company', 'Partner']; 
  fields = [
    ['name', 'gender', 'birthdate', 'phone_number', 'industry', 'description'],
    ['name', 'phone_number', 'website', 'industry', 'description'],
    ['name', 'phone_number', 'industry', 'description']
  ];
  genders = ['Prefer not to tell', 'Male', 'Female', 'Other'];
  getProfileURL = "/profile/getProfile"; 
  updateProfileURL = "/profile/updateProfile";
  updateProfilePicURL = "/profile/updateProfilePic"; 
  defaultPicURL = "/profilepics/default/default_profile_pic.jpg";

  state = {
    username: null,
    type: null,
    profile: {},
    updatedProfile: {}, 
    error: null,
    edit: false,
    img: null
  }
  getProfileData = async (username) => {
    // ajax
    let res; 
    let url = this.getProfileURL + '?username=' + username; 
    try {
      res = await fetch(
        url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      
      }
      );
    }
    catch (err) {
      console.error(err); 
      this.setState({
        error: 'Internet Failure: Failed to connect to server.'
      })
      return;
    }
    
    let body; 
    let text;
    try{
      text = await res.text();
      body = JSON.parse(text);
    }
    catch (err) {
      console.log(text);
      console.error(err); 
      this.setState({
        error: 'Failed to parse response body as JSON. '
      });
      return; 
    }

    if (res.ok) {
      // 2xx
      this.setState({
        username,
        type: body.type,
        profile: body.profile,
        updatedProfile: JSON.parse(JSON.stringify(body.profile)) // deep copy 
      });
    }
    else {
      // 4xx
      this.setState({
        error: `${res.status}: ${body.message}`
      }); 
    }
  }

  componentDidMount() {
    let { username } = this.props.match.params; 
    this.getProfileData(username);
  }

  enterEditMode = () => {
    this.setState({edit: true});
  }

  postProfileUpdates = async (updates) => {
    console.log('postUpdates');
    let res;
    try {
      res = await fetch(
        this.updateProfileURL, {
        method: 'POST',
        body: JSON.stringify({
          updates
        }),
        headers: {
          'content-type': 'application/json'
        }
      
      }
      );
    }
    catch (err) {
      console.error(err); 
      this.setState({
        error: 'Internet Failure: Failed to connect to server.'
      })
      return;
    }
    let body; 
    try{
      body = await res.json();
    }
    catch (err) {
      console.error(err); 
      this.setState({
        error: 'Failed to parse response body as JSON. '
      })
      return; 
    }
    if (res.ok) {
      // 2xx
      await this.getProfileData(this.state.username); 
      this.setState({
        edit: false
      });
    }
    else {
      // 4xx
      this.setState({
        error: `${res.status}: ${body.message}`
      }); 
    }
  }

  postNewProfilePic = async () => {
    let res; 
    let file = this.state.img; 
    let formdata = new FormData(); 
    formdata.append('file', file);

    try {
      res = await fetch (
        this.updateProfilePicURL,
        {
          method: 'POST', 
          body: formdata
        }
      )
    }
    catch (err) {
      console.error(err); 
      this.setState({
        error: 'Internet Failure: Failed to connect to server.'
      });
      return;
    }
    if (!res.ok) {
      let body; 
      try {
        body = await res.json(); 
        this.setState({
          error: body.message
        });
      }
      catch (err) {
        console.error(err); 
        this.setState({
          error: 'Failed to parse response body as JSON. '
        });
        return; 
      }
    }
    this.setState({img: null, edit: false});
  }

  updateProfileData = async () => {
    let updatedProfile = JSON.parse(JSON.stringify(this.state.updatedProfile));
    let updates = {};

    // List of profile fields for all three kinds of users. Not including tags
    let fields = this.fields; 

    for (let key of fields[this.state.type]) {
      let id = 'input-' + key;
      let val = document.getElementById(id).value; 
      if (key === 'gender') {
        val = parseInt(val);
      }
      updatedProfile[key] = val;
    }
    let hasUpdate = false; 
    // Find all changed fields. 
    for (let key in updatedProfile) {
      
      if (updatedProfile[key] === this.state.profile[key]) {
        continue;
      }
      if (updatedProfile[key] instanceof Array && 
        updatedProfile[key].length === this.state.profile[key].length) {
        let equals = true; 
        for (let i = 0; i < updatedProfile[key].length; i++) {
          if (updatedProfile[key][i] !== this.state.profile[key][i]) {
            equals = false;
            break;
          }
        }
        if (equals) {
          continue; 
        }
      }
      updates[key] = updatedProfile[key];
      hasUpdate = true;
    }

    let promises = [];
    if (hasUpdate) {
      promises.push(this.postProfileUpdates(updates));
    }    
    if (this.state.img !== null) {
      promises.push(this.postNewProfilePic()); 
    }
    console.log(promises); 
    if (promises.length !== 0) {
      await Promise.all(promises); 
    }
    await Utils.updateSelfAbstract(); 

  }

  discardChanges = () => {
    this.setState({
      updatedProfile: JSON.parse(JSON.stringify(this.state.profile)),
      edit: false
    });
    const profilePic = document.getElementById('profile-pic');
    let src; 
    switch (this.state.profile.pfp_type) {
      case 0:
        src = this.defaultPicURL;
        break;
      case 1:
        src = "/profilepics/users/" + this.state.username + ".jpg";
        break;
      case 2:
        src = "/profilepics/users/" + this.state.username + ".png";
        break; 
      default:
        break; 
    }
    profilePic.src = src; 
  }
  
  loadImg = () => {
    const imgInput = document.getElementById('change-photo-input');
    const profilePic = document.getElementById('profile-pic');
    profilePic.src = URL.createObjectURL(imgInput.files[0]);
    this.setState({img: imgInput.files[0]});
  }

  render() {

    if (this.state.error !== null && this.state.profile===null) {
      // Error occured before profile data was loaded. 
      return(<><h1 className="warningMsg">{this.state.error}</h1></>);
    }

    if (this.state.username === null) {
      // If this.getProfileData havn't finish executing
      return(<Loading />);
    }
    
    let profile = this.state.profile;
    let updatedProfile = this.state.updatedProfile;
    console.log(profile);
    let tags = profile.tags.map((tag)=>{return <Tag tag={tag} key={tag}/>}); 
    let type = this.state.type;

    return(
      <div className="profile">
        
        {/* grid display column 1 */}
        <div className="grid1">
        <h2 className="warningMsg">{this.state.error}</h2>
        </div>

        {/* grid display column 2 */}
        <div className="grid2">

          {/* profile picture */}
          <div className="grid2-photo">
          <img id="profile-pic" alt="profile pic" src={
            profile.pfp_type === 0?
            this.defaultPicURL:
              profile.pfp_type === 1?
              "/profilepics/users/" + this.state.username + ".jpg":
              "/profilepics/users/" + this.state.username + ".png"
          }></img>
            {
              this.state.edit === true?
              <div className="change-photo">
                <span>Change profile picture</span>
                <input 
                type="file" 
                id="change-photo-input" 
                accept=".jpg,.jpeg,.png"
                onChange={this.loadImg}></input>
              </div>:
              <></>
            }
          </div>

          {/* profile information */}
          <div className="grid2-infoarea">

            <div className="grid2-name">
              {/* profile fullname */}
              <b>
                {this.state.edit===true? 
                <>
                  <span>{this.state.type === 1? 'Company Name: ': 'Your Name: '}</span>
                  <input
                  id="input-name" 
                  defaultValue={updatedProfile.name}></input>
                </>:
                <span>{profile.name}</span>}
              </b>
            </div>

            <div className="grid2-title">
              {/* profile account type */}
              <span>{this.userTypes[this.state.type]}</span>
            </div>
          </div>

          {/* profile information */}
          <div className="grid2-infoarea2">

            {/* profile birthday */}
            { type === 0? 
            <div className="grid2-text">
              {
                this.state.edit === true?
                <>
                  <span>Birthday:</span>
                  <input type="date" defaultValue={updatedProfile.birthdate}
                  id="input-birthdate"/>
                </>:
                <span>Birthday: {profile.birthdate}</span>
              }
              {/* company website */}
            </div>:
            <></>
            }

              {
                type === 1?
                <div className="grid2-text">
                  <span>Website: </span>
                  {
                    this.state.edit === true? 
                    <input id="input-website" defaultValue={updatedProfile.website} />:
                    <span>{profile.website}</span>
                  }
                </div>
                :
                <></>
              }

            {type === 0? 
            <div className="grid2-text">
              <span>Gender: </span>
              { this.state.edit === true?
              <select id='input-gender'>
                <option key="0" value="0">Prefer not to tell</option>
                <option key="1" value="1">Male</option>
                <option key="2" value="2">Female</option>
                <option key="3" value="3">Other</option>
              </select>:
              <span>{this.genders[profile.gender]}</span>}
            </div>:
            <></>
            }
            {/* profile email */}
            <div className="grid2-text">
              <span>Email: {profile.email}</span>
            </div>

            

            {/* profile phone number */}
            <div className="grid2-text">

              <span>Phone: </span>
            {
              this.state.edit === true?
              <input id="input-phone_number" defaultValue={updatedProfile.phone_number}/>:
              <span>{profile.phone_number}</span>
            }
            </div>

            {/* direct to profile edit page */}
            <div className="grid2-edit">
              {
                this.state.edit === true? 
                <>
                  <button className="grid2-btn" onClick={this.updateProfileData}>Confirm</button>
                  <button className="grid2-btn" id="discard-btn" onClick={this.discardChanges}>Discard</button>
                </>: 
                localStorage.getItem('username') === this.state.username?
                <button className="grid2-btn" onClick={this.enterEditMode}>Edit</button>:
                <></>
              }
            </div>

          </div>

        </div>

        {/* grid display column 3 */}
        <div className="grid3">
        
        </div>

        {/* grid display column 4 */}
        <div className="grid4">

          <div className="grid4-aboutme">
            <h1 className="grid4-aboutme-header">
              {type === 1?
                <span>About Us</span>:
                <span>About Me</span>
              }
            </h1>
            <div className="grid4-aboutme-text">
              {/* profile aboutme section */}
              {this.state.edit === true?
                <textarea 
                className="edit-textbox" 
                id="input-description" 
                defaultValue={updatedProfile.description} 
                />:
                <span>
                  {profile.description}
                </span>
              }
            </div>
          </div>

          <div className="grid4-industry">
            <h1 className="grid4-industry-header">
              Focused Industry
            </h1>
            <div className="grid4-industry-text">
              {/* profile aboutme industry */}
              {this.state.edit === true?
                <textarea 
                className="edit-textbox" 
                id="input-industry" 
                defaultValue={updatedProfile.industry} 
                />:
                <span>
                  {profile.industry}
                </span>
              }
            </div>
          </div>

          <div className="grid4-tag">
            <h1 className="grid4-tag-header">Tags</h1>
            <div className="grid4-tag-text">
              {/* profile tag section */}
              {tags}
            </div>
          </div>

        </div>

        {/* grid display column 5 */}
        <div className="grid5">
        
        </div>

      </div>
    );
  }
}