import React, { Component} from 'react'; 
import './video.css';
import video_notAvailable from '../../../resource/icons/video_notAvailable.png'
import Video from '../../components/video/video';



export default class video extends Component{
    render() {

        return (
            <div className="video_page">
                
                <div className="video_page_wrapper">

                    <div className="video_page_sidenav">
                        <a>Trending</a>
                        <a>Latest</a>
                    </div>

                    <div className="video_page_content">

                        <div className="video_slideshow_section">
                            <div className="video_slideshow">
                                <div className="video_slideshow_container clearfix">
                                    <img src={video_notAvailable}></img>
                                    <img src={video_notAvailable}></img>
                                    <img src={video_notAvailable}></img>
                                    <img src={video_notAvailable}></img>
                                </div>
                            </div>

                            <span className="video_slideshow-left">
                                &lt;
                            </span>

                            <span className="video_slideshow-right">
                                &gt;
                            </span>
                        </div>

                        <div className="trending clearfix">
                            <h2>Trending</h2>
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                        </div>

                        <div className="latest clearfix">
                            <h2>Latest</h2>
                            <Video />
                            <Video />
                            <Video />
                            <Video />
                        </div>
                    </div>

                </div>
            
            </div>
        )
        
    }
}