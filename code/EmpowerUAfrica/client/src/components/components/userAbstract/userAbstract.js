import React, {Component} from 'react'; 
import './userAbstract.css'; 
import Utils from '../../../utils'; 

// Small section of content that shows brief information of a user. 

const userTypes = ['Individual', 'Company', 'Partner']; 

export class UserAbstract extends Component {
    
    render() {
        let user = this.props.user; 
        
        if (user === undefined) {
            return (<h2 className="warningMsg">No data given to UserAbstract</h2>)
        }
        let pfp_url = Utils.getProfilePictureURL(user.username, user.pfp_type);

        return(
            <div className="user-abstract">
                <div className="ua-grid-1">
                    <a href={`/profile/${user.username}`} target="/">
                        <img 
                        src={pfp_url} 
                        alt={user.name + '_pfp'} 
                        className="profile-pic"
                        ></img>
                    </a>
                </div>
                <div className="ua-grid-2">
                    <a href={`/profile/${user.username}`} className="user-name" target="/">
                        <span>{user.name}</span>
                    </a>
                    <span className="user-username">@{user.username}</span>
                    <span className="user-type">{userTypes[user.type]}</span>
                </div>
                <div className="ua-grid-3">
                    <span className="user-description">{user.description}</span>
                </div>
            </div>
        );
    }
}

export class UserAbstractSmall extends Component {
    render() {
        let user = this.props.user; 
        if (user === undefined) {
            return (<h2 className="warningMsg">No data given to UserAbstract</h2>)
        }
        return (
            <div className="user-abstract-small">
                <a href={`/profile/${user.username}`} className="user-name-small" target="/">
                    <p>{user.name}<span className="user-username">@{user.username}</span></p>
                    
                </a>
            </div>
        )
    }
}