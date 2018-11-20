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
import Switch from '@material-ui/core/Switch';


const defaultWeight = 1.0;

class DynamicsDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      parents: [],
      comment: '',
      diary_reference: '',
      target: false,
      parent_explanation: 1
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
    var dynamics = pick(this.state, ['target', 'name', 'parents', 'comment', 'diary_reference', 'parent_explanation']);
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

  handleCheckedChange = (key, checked, weight, comment)=> {
    var checkedList = this.state.parents;
    if (checked) {
      checkedList[key] = {weight, comment}
    } else {
      delete checkedList[key]
    }
    this.setState({
      parents: checkedList,
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
          fullWidth = {true}
          maxWidth='md'
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
              Parents
            </DialogContentText>            
            <FormGroup >
              {map(this.props.nodes, (node, index) => (
                <div key={`div_${index}`}>
                  <FormControlLabel 
                    value={`${index}`} 
                    key={`check_${index}`}
                    control={
                      <Checkbox 
                        checked={Object.keys(this.state.parents).indexOf(node.key) >= 0} 
                        onChange={(event, checked) => this.handleCheckedChange(node.key, checked, defaultWeight, '')}
                      />
                    }
                    label={node.name} 
                  />
                  {(Object.keys(this.state.parents).indexOf(node.key) >= 0) && 
                    <TextField
                      value={this.state.parents[node.key].weight}
                      key={`weight_${index}`} 
                      onChange={(event) => this.handleCheckedChange(node.key, true, event.target.value, this.state.parents[node.key].comment)}
                      id = "weight"
                      label = "Weight"
                      type = "number"
                      required = {false}
                    /> 
                  }
                  {(Object.keys(this.state.parents).indexOf(node.key) >= 0) && 
                    <TextField
                      value={this.state.parents[node.key].comment}
                      key={`comment_${index}`} 
                      onChange={(event) => this.handleCheckedChange(node.key, true, this.state.parents[node.key].weight, event.target.value)}
                      id = "comment"
                      label = "Comment"
                      type = "text"
                      required = {false}
                    />
                  }
                </div>                          
              ))}             
            </FormGroup>
            <TextField
              value={this.state.parent_explanation}
              onChange={this.handleChange('parent_explanation')}
              margin = "dense"
              id = "parent_explanation"
              label = "Explanation factory of parents"
              type = "number"
              required = {false}
              fullWidth
            />             
            <FormControlLabel
              control={
                <Switch
                  value= {this.state.target ? '': 'True'}
                  color = "primary"
                  checked={this.state.target}
                  onChange={this.handleChange('target')}
                />
              }
              label='Target'
            />                                
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
              <Button onClick={this.props.deleteCallback} color="secondary">
                Delete
              </Button>
            }
            <Button onClick={this.props.cancelCallback} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submitCallback} color="primary">
              Add Dynamics Node
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default DynamicsDialog;