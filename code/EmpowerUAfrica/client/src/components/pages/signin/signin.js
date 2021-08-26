import React, { Component } from 'react'; 
import './signin.css';
import Utils from '../../../utils';



export default class signin extends Component {

    signinURL = '/account/signin';

    state = {
        error: null
    }

    sendSigninRequest = async () => {
        let id = document.getElementById('signin-username-input').value; 
        let password = document.getElementById('signin-password-input').value; 
        let res;

        try {
            res = await fetch(this.signinURL, {
                method: 'POST', 
                body: JSON.stringify({
                    id, 
                    password
                }), 
                headers: {
                    'content-type': 'application/json'
                }
            });
        }
        catch (err) {
            alert('Internet Failure');
            console.error(err);
            return; 
        }
        let body
        try{
            body = await res.json();
        }
        catch (err) {
            console.error(err);
            return;
        }

        // Sign in success
        if (res.ok) {
            localStorage.setItem('signedIn', true);
            localStorage.setItem('username', body.username); 

            await Utils.updateSelfAbstract(); 
            window.location.replace('/');
            return; 
        }
        this.setState({error: body.message});
    }

  render() {

    let errMsg = this.state.error === null ? 
        "": 
        this.state.error; 

    return(
        <div className="signin-page">
            &nbsp;
            <div className="signin-field">

                <div className="signin-left">
                    {/* Welcome message */}
                    <p className="signin-left-title">Welcome back</p>
                    <p className="signin-left-text">To keep connected with us please sign in with 
                        your personal information by email and password
                    </p>
                    {/* link to signup page */}
                    <p className="signin-left-text2">Or create an account if you do not have one
                    </p>
                    <a id="direct-signup" href="/signup">Create your account</a>
                </div>

                <div className="signin-midleft">

                </div>

                <div className="signin-midright">
                    {/* sign in page title */}
                    <h2 className="signin-title">
                        Sign in
                    </h2> 

                    <div className="signin-form-field">
                        
                        {/* user name or email input */}
                        <div>
                            <div>
                                Username/Email
                            </div>
                            <input type="text" id="signin-username-input"/>
                        </div>
                        <br/>
                        
                        {/* password input */}
                        <div>
                            <div>
                                Password
                            </div>
                            <input type="password" id="signin-password-input"/>
                        </div>

                    </div>
                    
                    {/* error message */}
                    <p className="errorMsg">{errMsg}</p>

                    {/* login button */}
                    <div className="signin-button">
                        <button id="signin-button" onClick={this.sendSigninRequest}>
                            Login
                        </button>
                    </div>
                </div>

                <div className="signin-right">

                </div>

            </div>
        </div>
    )
  }
} 

