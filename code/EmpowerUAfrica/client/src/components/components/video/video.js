import React, { Component } from 'react'; 
import './video.css';
import video_notAvailable from '../../../resource/icons/video_notAvailable.png'

// This component is a video

export default class video extends Component{
    render() {
        return (
            <div className='video_component'>

                <video width="320" height="240" controls>
                    <source src="" type="video/mp4" />
                </video>
            </div>
        )
    }
}