import React, { Component } from 'react'; 
import './signup.css';



export default class sutype extends Component {
  render() {
    return(
        <div className="signup-type">
            <button> Sign up as Individual </button>
            <button> Sign up as Company </button>
            <button> Sign up as Partner </button>
        </div>
    )
  }
}