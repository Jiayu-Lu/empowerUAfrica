import React, { Component } from 'react'; 
import "./profile_edit.css"


export default class profile_edit extends Component {

    render() {

        return(
          <div className="edit-profile">
            
            {/* grid display column 1 */}
            <div className="edit-grid1">
            
            </div>

            {/* grid display column 2 */}
            <div className="edit-grid2">

              {/* profile photo */}
              <div className="edit-grid2-photo">
                {/* button to upload a photo */}
                <a id="change-photo">change photo</a>
              </div>

              <div className="edit-grid2-infoarea">

                {/* profile information */}
                <div className="edit-grid2-name">
                  <div>
                    {/* profile firstname */}
                    <span>First Name:&nbsp;</span>
                    <input type="name" id="fname"></input>
                  </div>
                  <div>
                    {/* profile lastname */}
                    <span>Last Name:&nbsp;</span>
                    <input type="name" id="lname"></input>
                  </div>
                </div>

                <div className="edit-grid2-title">
                  {/* profile account type */}
                  <input type="text" id="type"></input>
                </div>
              </div>

              <div className="edit-grid2-infoarea2">

                <div className="edit-grid2-age">
                  <div>
                    {/* profile age */}
                    <span>Age:&nbsp;</span>
                    <input type="number" id="age"></input>
                  </div>
                </div>

                <div className="edit-grid2-location">
                  <div>
                    {/* profile location */}
                    <span>Location:&nbsp;</span>
                    <input type="text" id="location"></input>
                  </div>
                </div>

                <div className="edit-grid2-email">
                  <div>
                    {/* profile email */}
                    <span>Email:&nbsp;</span>
                    <input type="email" id="email"></input>
                  </div>
                </div>

                <div className="edit-grid2-phone">
                  <div>
                    {/* profile phone */}
                    <span>Phone:&nbsp;</span>
                    <input type="text" id="phone"></input>
                  </div>
                </div>

                <div className="edit-grid2-confirm">
                  {/* profile confirm button */}
                  <a id="edit-grid2-confirm">Confirm</a>
                </div>

              </div>

            </div>

            {/* grid display column 3 */}
            <div className="edit-grid3">
            
            </div>

            {/* grid display column 4 */}
            <div className="edit-grid4">

              <div className="edit-grid4-aboutme">
                <h1 className="edit-grid4-aboutme-header">About me</h1>
                <div className="edit-grid4-aboutme-text">
                  <div>
                    {/* profile aboutme */}
                    <textarea type="text" id="edit-aboutme"></textarea>
                  </div>
                </div>
              </div>

              <div className="edit-grid4-industry">
                <h1 className="edit-grid4-industry-header">Industry</h1>
                <div className="edit-grid4-industry-text">
                  <div>
                    {/* profile industry */}
                    <textarea type="text" id="edit-industry"></textarea>
                  </div>
                </div>
              </div>

              <div className="edit-grid4-tag">
                <h1 className="edit-grid4-tag-header">
                  Tag
                  {/* button to add a tag */}
                  <button id="tag-add">+</button>
                </h1>
                <div className="edit-grid4-tag-text">
                  <p className="edit-grid4-tag1">
                    {/* profile tag */}
                    <input type="text" id="edit-grid4-tag1"></input>
                  </p>
                  <p className="edit-grid4-tag2">
                    <input type="text" id="edit-grid4-tag2"></input>
                  </p>
                  <p className="edit-grid4-tag3">
                    <input type="text" id="edit-grid4-tag3"></input>
                  </p>
                </div>
              </div>

            </div>

            {/* grid display column 5 */}
            <div className="edit-grid5">
            
            </div>

          </div>
        )
      }
  
}