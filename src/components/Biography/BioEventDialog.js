import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import PreviewIcon from '@material-ui/icons/RemoveRedEyeRounded';
import EditIcon from '@material-ui/icons/Edit';
import renderHTML from 'react-render-html';
import * as showdown from 'showdown';
import {githubTemplate} from '../../helpers/htmlHelper';
import pick from 'lodash/pick';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ReasonDialog from './ReasonDialog';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  positive: {
      backgroundColor: 'green',
    },
    negative: {
      backgroundColor: 'red',
    },
    neutral: {
      backgroundColor: 'yellow',
    }
  });

class BioEventDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      title: '',
      start: '',
      end: '',
      group: '',
      subgroup: '',
      logo: '',
      description: '',
      descriptionEditMode: true,
      reasons: [],
      reasonDialogOpen: false,
      selectedReason: undefined
    }; 
    this.converter = new showdown.Converter();
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  state2event = () => 
    pick(this.state, ['name', 'title', 'start', 'end', 'group', 'subgroup', 'logo', 'description']);

  validateFields = () => 
    !!this.state.name
    && !!this.state.title
    && !!this.state.start 
    && !!this.state.group;

  submitCallback = () => {
    if (this.validateFields()) {
      this.props.submitCallback(
        this.state2event());
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };  
    
  openReasonDialog = reason => {
    this.setState({
      reasonDialogOpen: true,
      selectedReason: reason
    });
  };  

  reasonCancelCallback() {
    this.setState({reasonDialogOpen: false})
  }  

  reasonEditCallback(reason) {
    this.setState({reasonDialogOpen: false});
    return this.props.submitReasonCallback(reason).then(() => {
      var {reasons} = this.state;
      if (!!reason.id) {
        reasons = reasons.map(reason2 => reason2.id === reason.id ? reason: reason2);
      } else {
        reasons.push(reason);
      }
      this.setState(reasons);
    });
  }

  reasonDeleteCallback() {
    this.setState({reasonDialogOpen: false});
    if (!!this.state.selectedReason.id) {
      return this.props.deleteReasonCallback(this.state.selectedReason.id).then(() => {
        var {reasons} = this.state;
        reasons = reasons.filter(reason => reason.id !== this.state.selectedReason.id);
        this.setState(reasons);
      });
    } else {
      return Promise.reject("Could not delete");
    }
  }

  componentDidMount() {
    if (!!this.props.event) {
      var stateCopy = {...this.state};
      Object.keys(this.props.event).forEach(key => stateCopy[key] = this.props.event[key]);
      stateCopy.descriptionEditMode = false;
      this.setState(stateCopy);
    }
  }  

  render() {
    return (
      <div>
       <Dialog
          maxWidth = {'lg'}
          open={true}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{this.state.name}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.props.dialogText}
            </DialogContentText>
            {this.state.descriptionEditMode && (
              <div>
                <IconButton aria-label="Preview" onClick={() => this.setState({descriptionEditMode: false})}>                  
                  <PreviewIcon fontSize="small" />
                </IconButton>                
                <TextField
                  value={this.state.description}
                  onChange={this.handleChange('description')}
                  fullWidth
                  margin = "dense"
                  id = "event_description"
                  label = "Long description"
                  type = "text"
                  required = {false}
                  multiline = {true}
                  rows = {5}
                  rowsMax = {15}              
                />
              </div>
            )} 
            {!this.state.descriptionEditMode && (
              <div>                 
                <Paper>  
                  <IconButton aria-label="Edit" onClick={() => this.setState({descriptionEditMode: true})}>                    
                    <EditIcon fontSize="small" />
                  </IconButton>                                   
                  <article>                  
                    {renderHTML(githubTemplate(this.converter.makeHtml(this.state.description)))}
                  </article>
                </Paper>
              </div>
            )}            
            <TextField
              value={this.state.name}
              onChange={this.handleChange('name')}
              margin = "dense"
              id = "event_name"
              label = "Name"
              type = "text"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.title}
              onChange={this.handleChange('title')}
              margin = "dense"
              id = "event_title"
              label = "Short description"
              type = "text"
              required = {true}
              multiline = {true}
              rows = {1}
              rowsMax = {5}              
              fullWidth
            />
            <TextField
              value={this.state.start}
              onChange={this.handleChange('start')}
              margin = "dense"
              id = "event_start"
              label = "Start date"
              type = "date"
              required = {true}
            /> 
            <TextField
              value={this.state.end}
              onChange={this.handleChange('end')}
              margin = "dense"
              id = "event_end"
              label = "End date"
              type = "date"
              required = {false}
            />                    
            <TextField
              value={this.state.group}
              onChange={this.handleChange('group')}
              margin = "dense"
              id = "event_group"
              label = "Group"
              type = "text"
              required = {true}
            />
            <TextField
              value={this.state.subgroup}
              onChange={this.handleChange('subgroup')}
              margin = "dense"
              id = "event_subgroup"
              label = "Subgroup"
              type = "text"
              required = {false}
            />
            <TextField
              value={this.state.logo}
              onChange={this.handleChange('logo')}
              margin = "dense"
              id = "event_logo"
              label = "Logo URL"
              type = "text" 
              required = {false}
            />
            {this.props.deleteCallback && (
              <div>
                <Typography variant="h6">
                  Reasons
                </Typography>            
                <List component="nav" aria-label="Reasons">
                  {this.state.reasons.map(reason => (
                  <ListItem
                    key = {reason.id}
                    className={reason.type > 0 ? this.props.classes.positive : reason.type < 0 ? this.props.classes.negative: this.props.classes.neutral}
                    button
                    onClick={_ => this.openReasonDialog(reason)}
                    >
                    <ListItemText primary={reason.name} />
                  </ListItem>
                  ))}
                <ListItem 
                    key = "item_new"
                    button
                    onClick={_ => this.openReasonDialog()}
                    >
                    <ListItemText primary="Add new reason" />
                </ListItem>                
                </List>
              </div>               
            )}
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="secondary">
              Delete
            </Button>}
            <Button onClick={this.submitCallback} color="primary">
              Edit event
            </Button>
            <Button onClick={this.props.cancelCallback} color="primary">
              Cancel
            </Button>            
          </DialogActions>
        </Dialog>
        {!!this.state.reasonDialogOpen && (
          <ReasonDialog  
            reason = {this.state.selectedReason}
            deleteCallback = {!!this.state.selectedReason ? this.reasonDeleteCallback.bind(this): undefined}
            cancelCallback = {this.reasonCancelCallback.bind(this)}
            submitCallback = {this.reasonEditCallback.bind(this)}            
          />
        )}
      </div>
    )
  }
}

BioEventDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BioEventDialog);