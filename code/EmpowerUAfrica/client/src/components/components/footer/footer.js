import React from 'react';
import './footer.css'


const Footer = (props) => {

    return (
        <div>

            <div className="footer-area1">

                <div className="footer-brand">
                    <a id="footer-home" href="/">
                        {/* footer brand */}
                        EmpowerU Africa
                    </a>
                </div>

                <div className="footer-info">
                    <a id="footer-github" href="https://github.com/UTSCCSCC01/project-uoft-kings">
                        {/* link to team github repo */}
                        Visit Our Github Repo
                    </a>
                </div>

            </div>

            <div className="team-description">
                <p className="team">
                    {/* footer text */}
                    Team UOFT KINGS, CSCC01 project
                </p>
            </div>

        </div>

    );

};

export default Footer;