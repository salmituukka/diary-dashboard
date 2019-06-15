import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import pick from 'lodash/pick';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

class ReasonDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      type: '',
      description: '',
      id: undefined
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  state2reason = () => {
    return pick(this.state, ['name', 'type', 'description', 'id']);
  }

  validateFields = () => 
    true;

  submitCallback = () => {
    if (this.validateFields()) {
      this.props.submitCallback(
        this.state2reason());
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };  
    
  componentDidMount() {
    if (!!this.props.reason) {  
      var stateCopy = {...this.state};
      Object.keys(this.props.reason).forEach(key => stateCopy[key] = this.props.reason[key])
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
          <DialogTitle id="form-dialog-title">{"Reason dialog"}</DialogTitle>
          <DialogContent>
            <InputLabel htmlFor="type">Type</InputLabel>
            <Select
              value={this.state.type}
              onChange={this.handleChange('type')}
              inputProps={{
                name: 'type',
                id: 'type',
              }}
              fullWidth
            >
              <MenuItem value={1}>Positive</MenuItem>
              <MenuItem value={-1}>Negative</MenuItem>
              <MenuItem value={0}>Neutral</MenuItem>
            </Select>
            <TextField
              value={this.state.name}
              onChange={this.handleChange('name')}
              id = "reason_name"
              label = "Name"
              type = "text"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.description}
              onChange={this.handleChange('description')}
              id = "reason_description"
              label = "Description of the reason"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {10}              
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.timestamp}
              onChange={this.handleChange('date')}
              id = "reason_date"
              label = "Time"
              type = "date"            
              required = {false}
              fullWidth
            />                                                      
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="secondary">
              Delete
            </Button>}
            <Button onClick={this.submitCallback} color="primary">
              Edit reason
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

export default ReasonDialog;