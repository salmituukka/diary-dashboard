import React, { Component } from 'react';
import '../../App.css';
import SkillCloud from './SkillCloud';
import BioTimeline from './BioTimeline';
import {db} from '../../firebase';
import AddBioDialog from './AddBioDialog';
import {uploadBio} from "../../helpers/uploadHelper";
import withAuthorization from '../withAuthorization';
import AlertDialog from '../AlertDialog';
import moment from 'moment';

class Biography extends Component {
  componentDidMount() {
    this.bioEventListener = db.getLatestBioEvents(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const events = dataSnapshot.val();
      if (events != null) {
        this.setState({events});
      }
    }.bind(this));
    this.bioSkillsListener = db.getLatestBioSkills(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const skills = dataSnapshot.val();
      if (skills != null) {
        this.setState({skills});
      }
    }.bind(this));    
  }

  componentWillUnmount() {
    this.bioEventListener.off();
    this.bioSkillsListener.off();
  }

  constructor(props) {
    super(props);
  
    this.state = {      
      events: [],
      skills: [],
      error: []
    };
  }

  importCallback(file) {
    uploadBio(this.props.userId, this.props.branchId, file[0]).catch(err => {
      const error = {'title': 'Could not import bio', 'description': err.message || 'Could not import'};
      this.setState({error})
    });
  }

  editEventCallback(eventIndex, newEvent) {
    const keys = Object.keys(this.state.events);
    newEvent.time = moment().format('YYYYMMDDhhmmss');
    newEvent.type = 'MODIFY';
    db.putLatestBioEvent(this.props.userId, this.props.branchId, keys[eventIndex], newEvent).then(() =>
      db.postBioEventEvent(this.props.userId, this.props.branchId,  keys[eventIndex], newEvent)
    ).catch(err => {
      const error = {'title': 'Could not edit event', 'description': err.message || 'Could not edit event'};
      this.setState({error})
    });
  }

  deleteEventCallback(eventIndex) {
    const keys = Object.keys(this.state.events);
    const events = Object.values(this.state.events);
    var eventCopy = {...events[eventIndex]};
    eventCopy.time = moment().format('YYYYMMDDhhmmss');
    eventCopy.type = 'DELETE';    
    return db.deleteLatestBioEvent(this.props.userId, this.props.branchId, keys[eventIndex]).then(() =>
      db.postBioEventEvent(this.props.userId, this.props.branchId,  keys[eventIndex], eventCopy)
    ).catch(err => {
      const error = {'title': 'Could not delete event', 'description': err.message || 'Could not delete event'};
      this.setState({error})
    });
  }

  addEventCallback(event) {
    event.time = moment().format('YYYYMMDDhhmmss');
    event.type = 'ADD';    
    return db.postLatestBioEvent(this.props.userId, this.props.branchId, event).then((ref) =>
      db.postBioEventEvent(this.props.userId, this.props.branchId, ref.key, event)
    ).catch(err => {
      const error = {'title': 'Could not add event', 'description': err.message || 'Could not add event'};
      this.setState({error})
    });
  }

  addSkillCallback(skill) {
    skill.time = moment().format('YYYYMMDDhhmmss');
    skill.type = 'ADD';    
    return db.postLatestBioSkill(this.props.userId, this.props.branchId, skill).then((ref) =>
      db.postBioSkillEvent(this.props.userId, this.props.branchId, ref.key, skill)
    ).catch(err => {
      const error = {'title': 'Could not add skill', 'description': err.message || 'Could not add event'};
      this.setState({error})
    });
  }  

  editSkillCallback(skillIndex, newSkill) {
    const keys = Object.keys(this.state.skills);
    newSkill.time = moment().format('YYYYMMDDhhmmss');
    newSkill.type = 'MODIFY';    
    return db.putLatestBioSkill(this.props.userId, this.props.branchId, keys[skillIndex], newSkill).then(() =>
      db.postBioSkillEvent(this.props.userId, this.props.branchId,  keys[skillIndex], newSkill)
    ).catch(err => {
      const error = {'title': 'Could not edit skill', 'description': err.message || 'Could not edit skill'};
      this.setState({error})
    });
  }     

  deleteSkillCallback(skillIndex) {
    const keys = Object.keys(this.state.skills);
    const skills = Object.values(this.state.skills);
    var skillCopy = {...skills[skillIndex]};
    skillCopy.time = moment().format('YYYYMMDDhhmmss');
    skillCopy.type = 'DELETE';      
    return db.deleteLatestBioSkill(this.props.userId, this.props.branchId, keys[skillIndex]).then(() =>
      db.postBioSkillEvent(this.props.userId, this.props.branchId,  keys[skillIndex], skillCopy)
    ).catch(err => {
      const error = {'title': 'Could not delete skill', 'description': err.message || 'Could not delete skill'};
      this.setState({error})
    });
  }    

  closeErrorDialog() {  
    this.setState({error: []})
  }   
  
  render() {
    return (
      <div>
        <div style = {{marginLeft:'75px'}}>
          <BioTimeline 
            events = {Object.values(this.state.events)} 
            editEventCallback = {this.editEventCallback.bind(this)} 
            deleteEventCallback = {this.deleteEventCallback.bind(this)} 
            heightRatio = {0.3}/>
        </div>        
        <div className = "column">
          <SkillCloud 
            skills = {Object.values(this.state.skills)}
            deleteSkillCallback = {this.deleteSkillCallback.bind(this)}
            editSkillCallback = {this.editSkillCallback.bind(this)}
            yOffset={0.3}/>
        </div>
        <AddBioDialog 
          addEventCallback = {this.addEventCallback.bind(this)}
          addSkillCallback = {this.addEventCallback.bind(this)}
          importCallback = {this.importCallback.bind(this)}
        />
        <AlertDialog 
          error={this.state.error}
          id ="error-bio"
          handleClose = {this.closeErrorDialog.bind(this)}
        />             
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Biography);
