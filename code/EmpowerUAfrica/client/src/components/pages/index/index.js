import React, { Component } from 'react'; 
import "./index.css"


export default class index extends Component {

  componentDidMount() {
    document.title = "EmpowerU Africa";
  }

  render() {
    return(
    <div>

      <div className="title-image">
          <div className="wallup-text">
            {/* index page title */}
            Welcome to EmpowerU Africa
          </div>
      </div>

      <div className="title-area1">
          {/* text title */}
          <h1>Helping Africa’s brightest minds go from idea to MVP to market</h1>
      </div>

      <div className="mainpage-container title-area2">
        
        <div className="left">Initiatives</div>
        <div className="middle">
          {/* text content */}
          <p>
            The goal of the African Impact Challenge is to build the Africa we want to see, 
            by investing in our continent’s aspiring entrepreneurs-to-be. 
            We’re enabling them to build market-creating innovations, 
            which tackle their country’s biggest challenges with technology
          </p>
          <br></br>
          <p>
            Inspired by The Prosperity Paradox, it will be run in different African countries every year. 
            Our target is to successfully kick-start innovations aligned with our selection criteria across the continent. 
            We are doing this by providing the capital, resources and guidance necessary to begin from scratch; 
            with the help of our partners and the African Impact True Blue fund. 
          </p>
          <br></br>
            {/* link to africanimpact site */}
            <a id="learnmore" href="https://www.africanimpact.ca/the-african-impact-challenge">Learn More About Africa Impact Chanllenge</a>
        </div>  
        <div className="right"></div>
        
      </div>
    </div>
    )
  }
}
