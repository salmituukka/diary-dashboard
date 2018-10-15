import React from 'react';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import pick from 'lodash/pick';
import AlertDialog from '../AlertDialog';

import { db } from '../../firebase';


class PrivacySettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mission: false,
      dynamics: false,
      plan: false,
      diary_meta_tags: false,
      diary_meta_ratings: false,
      bio_events: false,
      bio_skills: false,
      diary_bodies: false,
      name: '',
      error: []
    };
  }

  componentDidMount() {
    db.getPrivacySettings(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const privacySettings = dataSnapshot.val();
      if (privacySettings != null) {
        this.setState({
          name: privacySettings.name,
          mission: privacySettings.mission || false,
          dynamics: privacySettings.dynamics || false,
          plan: privacySettings.plan || false,
          diary_meta_tags: privacySettings.diary_meta_tags || false,
          diary_meta_ratings: privacySettings.diary_meta_ratings || false,
          bio_events: privacySettings.bio_events || false,
          bio_skills: privacySettings.bio_skills || false,
          diary_bodies: privacySettings.diary_bodies || false
        });
      }
    }.bind(this));  
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  isAnyFieldPublic = () => Object.values(this.state).filter(val => typeof(val) === typeof(true)).some(a=>a);

  handleSubmit = () => {
    return db.putPrivacySettings(this.props.userId, this.props.branchId, pick(this.state, [
      'name', 'mission', 'dynamics', 'plan', 'diary_meta_tags','diary_meta_ratings', 'bio_events','bio_skills', 'diary_bodies'])
  ).then(
      () => 
      this.isAnyFieldPublic() ?
          db.putPublicBranch(this.props.branchId, {userId: this.props.userId, name: this.state.name})
          : db.deletePublicBranch(this.props.branchId)
    ).catch(err => {
      const error = {'title': `Could not edit privacy settings`, 'description': err.message || 'Could not edit privacy settings'};
      this.setState({error});
    });
  }

  privatePublicSwitch = (name, title) => (
    <FormControlLabel
    control={
      <Switch
        color = "primary"
        checked={this.state[name]}
        onChange={this.handleChange(name)}
        value={name}
      />
    }
    label={!title ? name.charAt(0).toUpperCase() + name.slice(1): title}
  />    
  ); 

  closeErrorDialog() {  
    this.setState({error: []})
  }  

  render() {
    return (
      <div align = "center">
        <FormControl component="fieldset" margin = "normal">
          <div align = "left">
            <FormLabel component="legend">Set publicity of each items</FormLabel>
            <FormGroup >
              {this.privatePublicSwitch('bio_events')}
              {this.privatePublicSwitch('bio_skills')}
              {this.privatePublicSwitch('mission')}
              {this.privatePublicSwitch('dynamics')}
              {this.privatePublicSwitch('plan')}
              {this.privatePublicSwitch('diary_meta_tags')}
              {this.privatePublicSwitch('diary_meta_ratings')}
              {this.privatePublicSwitch('diary_bodies')}
            
              {this.isAnyFieldPublic() && <TextField
                onChange={(event) => this.setState({name: event.target.value})}
                style = {{width: 300}}
                label="User name so that others can finds you"
                id="name"
                type = "text"
                value={this.state.name || this.props.userName} 
              />}
              <br/>
              <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                Submit
              </Button>   
            </FormGroup>        
          </div>
        </FormControl>
        <AlertDialog 
          error={this.state.error}
          id ="error-privacy"
          handleClose = {this.closeErrorDialog.bind(this)}
        />         
      </div>
    );
  }
}

export default PrivacySettings;