import React, { Component } from 'react';
import './loading.css'; 

// This will show up whenever a resource is loading. 
// It is currently a line of text, but it can be changed to a image, an animation etc. 

export default class Loading extends Component {

    render() {
        return (
            /* loading text */
            <p className="loadingText">Loading...</p>
        );
    }
}