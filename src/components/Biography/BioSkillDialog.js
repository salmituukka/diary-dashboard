import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import pick from 'lodash/pick';

class BioSkillDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      weight: '',
      groups: [],
      preference: '',
      description: ''
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  state2skill = () => {
    var skill = pick(this.state, ['name', 'description']);
    skill['groups'] = this.state.groups.split(',').map(group => group.trim());
    skill['weight'] = Math.round(this.state.weight);
    skill['preference'] = Math.round(this.state.preference);
    return skill;
  }

  validateFields = () => 
    !!this.state.name
    && !!this.state.weight && Math.round(this.state.weight) > 0 && Math.round(this.state.weight) < 6
    && !!this.state.groups 
    && !!this.state.preference && Math.round(this.state.preference) > 0 && Math.round(this.state.preference) < 4;

  submitCallback = () => {
    if (this.validateFields()) {
      this.props.submitCallback(
        this.state2skill());
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };  
    
  componentDidMount() {
    if (!!this.props.skill) {  
      var stateCopy = {...this.state};
      Object.keys(this.props.skill).forEach(key => stateCopy[key] = this.props.skill[key])
      stateCopy.groups = stateCopy.groups.join(',');
      this.setState(stateCopy);
    }
  }  

  render() {
    return (
      <div>
       <Dialog
          open={true}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{this.props.dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.props.dialogText}
            </DialogContentText>
            <TextField
              value={this.state.name}
              onChange={this.handleChange('name')}
              id = "skill_name"
              label = "Name of the skill"
              type = "text"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.weight}
              onChange={this.handleChange('weight')}
              id = "skill_title"
              label = "Greatness of the skill"
              type = "number"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.preference}
              onChange={this.handleChange('preference')}
              id = "skill_start"
              label = "Preference of the skill"
              type = "number"            
              required = {true}
              fullWidth
            /> 
            <TextField
              value={this.state.groups}
              onChange={this.handleChange('groups')}
              id = "skill_end"
              label = "Categories for the skill separated by comma"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {5}              
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.description}
              onChange={this.handleChange('description')}
              id = "skill_description"
              label = "Description of the skill"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {10}              
              required = {true}
              fullWidth
            />                                         
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="red">
              Delete
            </Button>}
            <Button onClick={this.submitCallback} color="primary">
              Edit skill
            </Button>
            <Button onClick={this.props.cancelCallback} color="primary">
              Cancel
            </Button>            
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default BioSkillDialog;