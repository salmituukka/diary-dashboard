import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddButton from '../AddButton';
import BioEventDialog from './BioEventDialog';
import BioSkillDialog from './BioSkillDialog';

class AddBioDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addSkillDialog: false,
      addEventDialog: false,
      showMainDialog: false
    }; 
  }
  handleClose() {
    this.setState({showMainDialog: false});
  }
  handleOpen() {
    this.setState({showMainDialog: true});
  }  
  handleAddEvent() {
    this.setState({addEventDialog: true})
  }
  handleAddSkill() {
    this.setState({addSkillDialog: true})
  }    
  eventDialogCancelCallback() {
    this.setState({showMainDialog: false});
    this.setState({addEventDialog: false})
  }
  skillDialogCancelCallback() {
    this.setState({showMainDialog: false});
    this.setState({addSkillDialog: false});
  }  
  eventDialogSubmitCallback(event) {
    this.setState({showMainDialog: false});
    this.setState({addEventDialog: false});
    this.props.addEventCallback(event);
  }
  skillDialogSubmitCallback(skill) {
    this.setState({showMainDialog: false});
    this.setState({addSkillDialog: false});
    this.props.addSkillCallback(skill);
  }  
  importDialogSubmitCallback(event) {
    this.setState({showMainDialog: false});
    this.props.importCallback(event.target.files);
  }    
  render() {
    return (
      <div>
        <div style = {{
          position: 'absolute',
          right: 0,
          bottom: `0px`,
          zIndex: 1
        }}>
          <AddButton onClick = {this.handleOpen.bind(this)}/> 
        </div>
        <Dialog
          open={this.state.showMainDialog}
        >
          <DialogTitle id="alert-dialog-title">Add biography item</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please, select one of the following actions
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <input
              style = {{display:'none'}}
              id = 'importId'
              accept = ".json"
              type = "file"
              onChange = {this.importDialogSubmitCallback.bind(this)}
            />
            <label htmlFor='importId'>
              <Button color="primary" component="span">
                Import data from json and delete all existing
              </Button>
            </label>
            <Button onClick={this.handleAddEvent.bind(this)} color="primary">
              Add new event to timeline
            </Button>
            <Button onClick={this.handleAddSkill.bind(this)} color="primary">
              Add new skill
            </Button>
            <Button onClick={this.handleClose.bind(this)} color="primary" autoFocus>
              Cancel
            </Button>                        
          </DialogActions>
        </Dialog>
        {!!this.state.addEventDialog && (
          <BioEventDialog  
            cancelCallback = {this.eventDialogCancelCallback.bind(this)}
            submitCallback = {this.eventDialogSubmitCallback.bind(this)}
          />
        )}
        {!!this.state.addSkillDialog && (
          <BioSkillDialog  
            cancelCallback = {this.skillDialogCancelCallback.bind(this)}
            submitCallback = {this.skillDialogSubmitCallback.bind(this)}
          />
        )}              
      </div>
    );
  }
}

export default AddBioDialog;