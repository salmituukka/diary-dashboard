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
import uuid4 from 'uuid/v4'

const secret_start_save_format_reg = /<SECRET=(\w|-)+\/>/gm;
const secret_start_view_format = '<SECRET>';
const secret_end_view_format = '</SECRET>';


const description2Edit = (text, secrets) => {
  const re = id => `<SECRET=${id}/>`;
  return secrets.reduce((accum, item) => 
  accum.replace(RegExp(re(item['id']), 'gm'), `${secret_start_view_format}${item['text']}${secret_end_view_format}`),
  text).replace(secret_start_save_format_reg, '')
}

const secretsFromTextWithTags = (textWithTags) => {
  //const re = /<SECRET>(((?!(<\/SECRET>))(.|\n|\r|\r\n))+$)/gm;
  var secretStarts = textWithTags.indexOf('<SECRET>')
  var newText = (' ' + textWithTags).slice(1)
  var secrets = []

  while (secretStarts >= 0) {
    var substring = textWithTags.substring(secret_start_view_format.length + secretStarts)
    var secretEnds = substring.indexOf('</SECRET>')
    if (secretEnds === -1) {
      break;
    }
    const uuid = uuid4()
    secrets.push({
      id:uuid,
      text: substring.slice(0, secretEnds)
    });
    newText = newText.replace(/<SECRET>((?!<SECRET>)(.|\n))+<\/SECRET>/m, `<SECRET=${uuid}/>`)
    secretStarts = textWithTags.indexOf('<SECRET>', secretStarts+1)
  }
  return {
    text: newText,
    secrets: secrets
  }
}

class BioEventDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      secrets: {},
      name: '',
      title: '',
      start: '',
      end: '',
      group: '',
      subgroup: '',
      logo: '',
      descriptionEdit: '',
      description: '',
      descriptionEditMode: true
    }; 
    this.converter = new showdown.Converter();
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  state2event = () => 
     pick(this.state, ['name', 'title', 'start', 'end', 'group', 'subgroup', 'logo', 'description', 'secrets']);

  validateFields = () => 
    !!this.state.name
    && !!this.state.title
    && !!this.state.start 
    && !!this.state.group;

  submitCallback = () => {
    if (this.validateFields()) {
      var event = this.state2event();
      if (this.state.descriptionEditMode) {
        const textAndSecrets = secretsFromTextWithTags(this.state.descriptionEdit)
        event.secrets = textAndSecrets.secrets;
        event.description = textAndSecrets.text;
      }
      this.props.submitCallback(event);
    }
  };

  replaceSecretTagsByColor = (text, secrets) => {
    const re = id => `<p><SECRET=${id}/></p>`;
    const textWithColors = secrets.reduce((accum, item) => 
    accum.replace(RegExp(re(item['id']), 'gm'), `<span style="color:rgb(255,0,0)">${this.converter.makeHtml(item['text'])}</span>`),
    text).replace(secret_start_save_format_reg, '').replace(secret_end_view_format, '')
    return textWithColors;
  }

  descriptionEditMode = () => {
    const descriptionEdit = description2Edit(this.state.description, this.state.secrets)
    this.setState({
       descriptionEdit,
      'descriptionEditMode': true
    })    
  }

  descriptionChange = () => {
    const textAndSecrets = secretsFromTextWithTags(this.state.descriptionEdit)
    this.setState({
      'description': textAndSecrets.text,
      'secrets': textAndSecrets.secrets,
      'descriptionEditMode': false
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };  
    
  componentDidMount() {
    if (!!this.props.event) {
      var stateCopy = {...this.state};
      Object.keys(this.props.event).forEach(key => stateCopy[key] = this.props.event[key]);
      stateCopy.start = stateCopy.start.format('YYYY-MM-DD');
      if (!!stateCopy.end) {
        stateCopy.end = stateCopy.end.format('YYYY-MM-DD');
      }
      stateCopy.descriptionEditMode = false;
      if (stateCopy.descriptionEditMode) {
        stateCopy.descriptionEdit = description2Edit(stateCopy.description, stateCopy.secrets)
      }
      this.setState(stateCopy);
    }
  }  

  render() {
    const {secrets} = this.state;
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
                <IconButton aria-label="Preview" onClick={() => {
                  this.descriptionChange()
                //  this.setState({descriptionEditMode: false})
                  }}>                  
                  <PreviewIcon fontSize="small" />
                </IconButton>                
                <TextField
                  value={this.state.descriptionEdit}
                  onChange={this.handleChange('descriptionEdit')}
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
                  <IconButton aria-label="Edit" onClick={this.descriptionEditMode}>                    
                    <EditIcon fontSize="small" />
                  </IconButton>                                   
                  <article>                  
                    {renderHTML(githubTemplate(this.replaceSecretTagsByColor(this.converter.makeHtml(this.state.description), secrets)))}
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