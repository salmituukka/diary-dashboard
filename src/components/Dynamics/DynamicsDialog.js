import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import pick from 'lodash/pick';
import map from 'lodash/map';

class DynamicsDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      positive_parents: [],
      negative_parents: [],
      comment: '',
      diary_reference: ''
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  validateInputs = () => {
      return !!this.state.name;
  }

  state2Dynamics = () => {
    var dynamics = pick(this.state, ['name', 'positive_parents', 'negative_parents', 'comment', 'diary_reference']);
    return dynamics;
  }  

  submitCallback = () => {
    if (this.validateInputs()) {
      this.props.submitCallback(this.state2Dynamics());
    }
  };  
    
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  }; 

  handleCheckedChange = (key, checked, name)=> {
    var checkedList = this.state[name];
    if (checked) {
      if (!!checkedList) {
        checkedList.push(key)
      } else {
        checkedList = [key];
      }
    } else {
      var index = checkedList.indexOf(key);
      if (index !== -1) {
        checkedList.splice(index, 1); 
      }
    }
    this.setState({
      [name]: checkedList,
    });
  };    
    
  componentDidMount() {
    if (!!this.props.dynamics) {  
      var stateCopy = {...this.state};
      Object.keys(this.props.dynamics).forEach(key => stateCopy[key] = this.props.dynamics[key])
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
              margin = "dense"
              id = "name"
              label = "Name"
              type = "text"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.comment}
              onChange={this.handleChange('comment')}
              margin = "dense"
              id = "comment"
              label = "Comment"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {3}
              required = {false}
              fullWidth
            />
            <TextField
              value={this.state.diary_reference}
              onChange={this.handleChange('diary_reference')}
              margin = "dense"
              id = "diary_id"
              label = "ID in diary"
              type = "text"
              required = {false}
              fullWidth
            />
            <DialogContentText>
              Positive parents
            </DialogContentText>            
            <FormGroup >
              {map(this.props.nodes, (node, index) => (
                <FormControlLabel 
                  value={`${index}`} 
                  key={index} 
                  control={
                    <Checkbox 
                      checked={this.state.positive_parents.indexOf(node.key) >= 0} 
                      onChange={(event, checked) => this.handleCheckedChange(node.key, checked, 'positive_parents')}
                    />
                  }
                  label={node.name} 
                />
              ))}
            </FormGroup>
            <DialogContentText>
              Negative parents
            </DialogContentText>            
            <FormGroup >
              {map(this.props.nodes, (node,index) => (
                  <FormControlLabel 
                    value={`${index}`} 
                    key={index} 
                    control={
                      <Checkbox 
                        checked={this.state.negative_parents.indexOf(node.key) >= 0} 
                        onChange={(event, checked) => this.handleCheckedChange(node.key, checked, 'negative_parents')}
                      />
                    }
                    label={node.name} 
                  />
              ))}
            </FormGroup>                        
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
              <Button onClick={this.props.deleteCallback} color="red">
                Delete
              </Button>
            }
            <Button onClick={this.props.cancelCallback} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submitCallback} color="primary">
              Add Principle
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default DynamicsDialog;