import React, { Component } from 'react'; 
import './tag.css';

// This component is a tag button

export default class Tag extends Component{
    render() {
        return (
            <p className="tag-text">{this.props.tag}</p>
        )
    }
}