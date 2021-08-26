import React, { Component} from 'react'; 
import { Reading, Video, Deliverable } from '../courseModuleContent/courseModuleContent';
import CreateMaterial from '../../pages/createMaterial/createMaterial';
import Utils from '../../../utils';
import './courseModule.css';

/*
    props:
        - view: 'instructor' | 'student'
        - module: object
*/
const editModuleURL = '/learning/editModule'; 
const deleteModuleURL = '/learning/deleteModule'; 

export default class CourseModule extends Component{

    state = {
        expand: true,
        createMaterial: false,
        editModule: false
    }

    toggleExpand = () => {
        this.setState({
            expand: !this.state.expand
        }); 
    }

    expandCreateMaterialPanel = () => {
        this.setState({
            createMaterial: true
        })
    }
    collapseCreateMaterialPanel = () => {
        this.setState({
            createMaterial: false
        })
    }

    editModule = () => {
        this.setState({
            editModule: true 
        }); 
    }
    discardEditModule = () => {
        this.setState({
            editModule: false 
        }); 
    }

    deleteModule = async () => {
        const confirmation =`
        Deleting this module will also cascading delete every content under this module
        Do you want to continue? 
        `
        if (!window.confirm(confirmation)) {
            return; 
        }
        let res, body; 
        try {
            ({ res, body } = await Utils.ajax(
                deleteModuleURL,
                {
                    method: 'DELETE',
                    body: JSON.stringify({
                        moduleId: this.props.courseModule.id
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ))
        }
        catch(err) {
            console.error(err);
            alert('Internet failure. '); 
            return; 
        }
        if (res.ok) {
            window.location.reload();
        }
        else {
            alert(body.message); 
        }
    }

    render() {
        const { expand, createMaterial, editModule } = this.state; 
        const { view, courseModule } = this.props; 
        console.log(view); 
        const contents = courseModule.contents.map(
            content => {
                switch (content.type) {
                    case 'reading': return <Reading content={content} key={content.id} view={view}/>;
                    case 'video': return <Video content={content} key={content.id} view={view}/>;
                    case 'deliverable': return <Deliverable content={content} key={content.id} view={view}/>; 
                    default: return <></>
                }
            }
        ); 

        return (
            <div className="module_deliver">
                <div style={{cursor: 'pointer'}}>
                    <div onClick={this.toggleExpand}>
                        
                        {
                            editModule === true? 
                            <EditModule collapse={this.discardEditModule} moduleId={courseModule.id} moduleName={courseModule.name}/>
                            :
                            <>
                            <h2>{courseModule.name}</h2>
                            {
                                view === 'instructor'? 
                                <>
                                <img 
                                alt="edit module" 
                                src="/icons/edit.png"
                                className="icon"
                                onClick={(event) => {this.editModule(); event.stopPropagation()}}
                                ></img>
                                <img 
                                alt="delete module" 
                                src="/icons/garbage.png"
                                className="icon"
                                onClick={(event) => {this.deleteModule(); event.stopPropagation()}}
                                ></img>
                                </>: null
                            }
                            </>
                            
                        }
                        <button  className="toggle-expand-btn">
                            <div className={expand===true? 'triangle-left': 'triangle-down'}>

                            </div>
                        </button>
                    </div>
                </div>
                
                {expand === true ?
                    <div className='module_content'>
                        {contents}
                        { view === 'student' ? null :
                            createMaterial === true ?
                            <CreateMaterial module={courseModule} collapse={this.collapseCreateMaterialPanel}/>:
                            <button onClick={this.expandCreateMaterialPanel} id='add_deliver'>
                                +
                            </button>
                        }
                    </div>:
                    null
                    
                }
            </div>
        )
        
    }
}

class EditModule extends Component {
    submitChange = async () => {
        const { moduleId } = this.props; 
        const newModuleName = document.getElementById(`edit-module-name-${moduleId}`).value;
        if (newModuleName.length === 0) {
            alert('Module name cannot be empty. '); 
            return; 
        }
        let res, body; 
        try {
            ({ res, body } = await Utils.ajax(
                editModuleURL,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        id: moduleId,
                        name: newModuleName
                    }), 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ));
        }
        catch (err) {
            console.error(err); 
            alert('Internet failure'); 
            return; 
        }
        if (res.ok) {
            window.location.reload(); 
        }
        else {
            alert(body.message); 
        }
    }
    render() {
        const { moduleId, moduleName } = this.props; 
        return (
            <div className="edit-module" onClick={(event)=> {event.stopPropagation()}}>
                <table style={{width: '100%', textAlign: 'right'}}>
                    <colgroup>
                        <col style={{width: '60%'}}></col>
                        <col style={{width: '20%'}}></col>
                        <col style={{width: '20%'}}></col>
                    </colgroup>
                    <tbody>
                        <tr>
                            <td>
                                <input defaultValue={moduleName} id={`edit-module-name-${moduleId}`}></input>
                            </td>
                            <td>
                                <button 
                                className="cancel-btn"
                                onClick={this.props.collapse}
                                >
                                    <h2>Discard</h2>
                                </button>
                            </td>
                            <td>
                                <button 
                                className="confirm-btn"
                                onClick={this.submitChange}
                                >
                                    <h2>Done</h2>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>  
            </div>
        ); 
    }
}