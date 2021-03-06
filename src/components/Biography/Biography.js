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
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

class Biography extends Component {
  componentDidMount() {
    this.bioEventListener = db.getLatestBioEvents(this.props.userId, this.props.branchId, function(dataSnapshot, dataSnapshotSecrets) {
      const unorderedEvents = dataSnapshot.val();
      const secrets = !!dataSnapshotSecrets ? dataSnapshotSecrets.val() || {}: {};
      if (unorderedEvents != null) {
        // Create items array
        const keyValPair = Object.keys(unorderedEvents).map(function(key) {
          return [key, Object.assign(unorderedEvents[key], {secrets:Object.values(secrets[key] || [])})];
        });
        const sortEvents = (ev1,ev2) => {
          return !!ev1[1].subgroup && !!ev2[1].subgroup ? ev1[1].start - ev2[1].start + ev1[1].title > ev2[1].title
          :!!ev1[1].subgroup ? 1: !!ev2[1].subgroup ? -1: ev1[1].start - ev2[1].start + ev1[1].title > ev2[1].title;
        }      
        const events = mapValues(keyBy(keyValPair.sort(sortEvents), item=> item[0]), (item => item[1]));
        this.setState({events});
      }
    }.bind(this));
    this.bioSkillsListener = db.getLatestBioSkills(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const skills = dataSnapshot.val();
      if (skills != null) {
        this.setState({skills});
      }
    }.bind(this));
    this.bioImageListener = db.getBioImage(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const image = dataSnapshot.val();
      if (image != null) {
        this.setState({image});
      }
    }.bind(this));
  }

  componentWillUnmount() {
    this.bioEventListener.off();
    this.bioSkillsListener.off();
    this.bioImageListener.off();
  }

  constructor(props) {
    super(props);
  
    this.state = {      
      events: [],
      skills: [],
      image: undefined,
      error: [],
      timelineHeight: undefined
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
    const secrets = newEvent.secrets;
    delete newEvent['secrets'] 
    db.putLatestBioEvent(this.props.userId, this.props.branchId, keys[eventIndex], newEvent).then(() =>
      db.postBioEventEvent(this.props.userId, this.props.branchId,  keys[eventIndex], newEvent).then(()=> 
        Promise.all([secrets.map(secret => db.postBioEventSecretEvent(this.props.userId, this.props.branchId, keys[eventIndex], secret))])).then(()=>
          db.deleteLatestBioEventSecrets(this.props.userId, this.props.branchId, keys[eventIndex])).then(()=>
            Promise.all([secrets.map(secret => db.postLatestBioEventSecret(this.props.userId, this.props.branchId, keys[eventIndex], secret))]))
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
      db.postBioEventEvent(this.props.userId, this.props.branchId,  keys[eventIndex], eventCopy).then(()=>
        db.deleteLatestBioEventSecrets(this.props.userId, this.props.branchId, keys[eventIndex]))
    ).catch(err => {
      const error = {'title': 'Could not delete event', 'description': err.message || 'Could not delete event'};
      this.setState({error})
    });
  }

  addEventCallback(event) {
    event.time = moment().format('YYYYMMDDhhmmss');
    event.type = 'ADD';
    const secrets = event.secrets;
    event.delete('secrets')
    return db.postLatestBioEvent(this.props.userId, this.props.branchId, event).then((ref) =>
      Promise.all(secrets.map(secret => db.postLatestBioEventSecret(
        (this.props.userId, this.props.branchId, ref.key, secret)
      ))).then(() => 
        db.postBioEventEvent(this.props.userId, this.props.branchId, ref.key, event)
    )).catch(err => {
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

  editImageCallback(image) {   
    return db.putBioImage(this.props.userId, this.props.branchId, image).catch(err => {
      const error = {'title': 'Could not update image', 'description': err.message || 'Could not update image'};
      this.setState({error})
    });
  }   
  
  deleteImageCallback() {   
    return db.deleteBioImage(this.props.userId, this.props.branchId).catch(err => {
      const error = {'title': 'Could not delete image', 'description': err.message || 'Could not delete image'};
      this.setState({error});
    }).then(() => {
      this.setState({image: undefined});
    });
  } 

  closeErrorDialog() {  
    this.setState({error: []})
  }

  setTimelineHeight(timelineHeight) {
    if (this.state.timelineHeight !== timelineHeight) {  
      this.setState({timelineHeight})
    } else {
      this.setState({timelineHeight: undefined})
    }
  }  
  
  render() {
    const skills = Object.values(this.state.skills);
    const events = Object.values(this.state.events);
    const timelineHeight = this.state.timelineHeight !== undefined ? this.state.timelineHeight: (skills.length > 0 &&  events.length > 0 
      ? 0.3 :skills.length > 0 ? 0: 1);
    return (
      <div>
        {timelineHeight > 0 && (
          <div style = {{marginLeft:'45px'}} onDoubleClick={() => this.setTimelineHeight(1)}>
            <BioTimeline
              events = {events} 
              editEventCallback = {this.editEventCallback.bind(this)} 
              deleteEventCallback = {this.deleteEventCallback.bind(this)} 
              heightRatio = {timelineHeight}/>
          </div>
        )} 
        {timelineHeight < 1 && (
          <div className = "column" onDoubleClick={() => this.setTimelineHeight(0)}>
            <SkillCloud 
              skills = {skills}
              image = {this.state.image}
              deleteSkillCallback = {this.deleteSkillCallback.bind(this)}
              editSkillCallback = {this.editSkillCallback.bind(this)}
              deleteImageCallback = {this.deleteImageCallback.bind(this)}
              editImageCallback = {this.editImageCallback.bind(this)}            
              yOffset={timelineHeight}/>
          </div>
        )}
        <AddBioDialog 
          addEventCallback = {this.addEventCallback.bind(this)}
          addSkillCallback = {this.addSkillCallback.bind(this)}
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
