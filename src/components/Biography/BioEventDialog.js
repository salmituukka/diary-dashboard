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
    
  componentDidMount() {
    if (!!this.props.event) {
      var stateCopy = {...this.state};
      Object.keys(this.props.event).forEach(key => stateCopy[key] = this.props.event[key])
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
            {this.state.descriptionEditMode && (
              <div>
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
                <IconButton aria-label="Preview" onClick={() => this.setState({descriptionEditMode: false})}>                  
                  <PreviewIcon fontSize="small" />
                </IconButton>
              </div>
            )} 
            {!this.state.descriptionEditMode && (
              <div>
                <Paper>
                  <article>
                    {renderHTML(githubTemplate(this.converter.makeHtml(this.state.description)))}
                  </article>
                  <IconButton aria-label="Edit" onClick={() => this.setState({descriptionEditMode: true})}>                    
                    <EditIcon fontSize="small" />
                  </IconButton>
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
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="red">
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
      </div>
    )
  }
}

export default BioEventDialog;