import React, { Component } from 'react'; 
import { Redirect } from 'react-router-dom';
import "./setting_email.css"


export default class setting_email extends Component {
  state = {
    error: null
  }

  sendUpdateRequest = async () => {
    let email = document.getElementById('change-email-input').value; 
    let cemail = document.getElementById('cchange-email-input').value; 
    if (email !== cemail) {
      this.setState({error: 'Two email entries does not match. '});
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
            type: 'email', 
            'new': email
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
      alert('Email updated successfully'); 
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
    // THIS IS NOT GOOD. WE NEED A SETTINGS PAGE
    return(
      <div className="setting-ce">
        <div className="setting-ce-left">
          {/* setting page title */}
          <h2 className="ce-sidenav-title">Account Setting</h2>
          <div className="ce-sidenav">
              {/* side navbar */}
              <a id="ce-changepassword" href="/setting_password">Change Password</a>
              <a id="ce-changeemail" href="/setting_email">Change Email</a>
          </div>
        </div>

        <div className="setting-ce-midleft">

        </div>

        <div className="setting-ce-midright">
          <div className="change-email-section">
            {/* change email page title */}
            <h2 className="ce-form-field-title">Change Email</h2>
            <div className="ce-form-field">
                {/* new email input */}
                <div>
                  New Email
                </div>
                <input type="text" id="change-email-input"/>
                <br></br><br></br><br></br>

                {/* confirm new email */}
                <div>
                  Confrim Email
                </div>
                <input type="text" id="cchange-email-input"/>
                  
                <p className="errorMsg">{errorMsg}</p>

                <div className="ce-button">
                  {/* submit button */}
                  <button id="ce-button" onClick={this.sendUpdateRequest}>
                    Confirm
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}