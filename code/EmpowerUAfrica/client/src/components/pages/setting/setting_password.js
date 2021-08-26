import React, { Component } from 'react'; 
import { Redirect } from 'react-router-dom';
import "./setting_password.css"

// THIS IS NOT GOOD. WE NEED A SETTINGS PAGE
export default class setting_password extends Component {

  state = {
    error: null
  }

  sendUpdateRequest = async () => {
    let password = document.getElementById('change-password-input').value; 
    let cpassword = document.getElementById('cchange-password-input').value; 

    if (password !== cpassword) {
      this.setState({error: "Two password entries does not match"});
      return;
    }

    let res;
    try {
      res = await fetch(
        '/account/updateCredentials', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            type: 'password', 
            'new': password
          })
        }
      );
    }
    catch (err) {
      alert('Internet Failure'); 
      console.error(err); 
      return; 
    }
    let body; 
    try {
      body = await res.json(); 
    }
    catch (err) {
      console.error(err); 
      return; 
    }

    if (res.ok) {
      alert('Password updated successfully'); 
      window.location.reload(); 
      return; 
    }
    if (res.status === 403) {
      alert(body.message); 
      localStorage.setItem('signedIn', false); 
      localStorage.setItem('username', null); 
      window.location.replace("/signin");
    }
    this.setState({error: body.message});

  }

  render() {
    if (localStorage.getItem('signedIn') !== 'true') {
      return (
        <Redirect to="/signin" />
      )
    }
    
    let errorMsg = this.state.error === null ?
      "": 
      this.state.error; 
    
    return(
      <div className="setting-cp">

        <div className="setting-cp-left">
          {/* setting page title */}
          <h2 className="cp-sidenav-title">Account Setting</h2>
          <div className="cp-sidenav">
              {/* side navbar */}
              <a id="changepassword" href="/setting_password">Change Password</a>
              <a id="changeemail" href="/setting_email">Change Email</a>
          </div>
        </div>

        <div className="setting-cp-midleft">

        </div>

        <div className="setting-cp-midright">
          {/* change password title */}
          <h2 className="cp-form-field-title">Change Password</h2>
          <div className="cp-form-field">
            <div>
              {/* new password input */}
              <div>
                New Password
              </div>
                <input type="password" id="change-password-input"/>
              </div>
              <br></br><br></br>
              {/* confirm new password */}
              <div>
                <div>
                  Confrim Password
                </div>
                  <input type="password" id="cchange-password-input"/>
                </div>
              </div>

              {/* error message */}
              <p className="errorMsg">{errorMsg}</p>

              {/* submit button */}
              <div className="cp-button">
                <button id="cp-button" onClick={this.sendUpdateRequest}>
                  Confirm
                </button>
              </div>
          </div>

          <div className="setting-cp-right">
            
          </div>

      </div>
    )
  }
}