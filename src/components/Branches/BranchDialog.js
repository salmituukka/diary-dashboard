import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import map from 'lodash/map';

class BranchDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      comment: '',
      parentNr: '0'
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };


  submitCallback = () => {
    if (this.name != null && this.name.value != null) {
      this.props.submitCallback(
        this.name.value, 
        this.comment.value || '', 
        this.state.parentNr
      );
    }
  };  

  handleParentChange = (event, index) => {
    this.setState({ parentNr: index });
  };

    
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
              inputRef={text => this.name = text}
              margin = "dense"
              id = "name"
              label = "Branch"
              type = "text"
              required = {true}
              defaultValue = {this.props.branch.name}
              fullWidth
            />
            <TextField
              inputRef={text => this.comment = text}
              margin = "dense"
              id = "comment"
              label = "Comment"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {3}
              required = {false}
              defaultValue = {this.props.branch.comment}
              fullWidth
            />
            <DialogContentText>
              Parent node
            </DialogContentText>            
            <RadioGroup
                ref={ref => {
                  this.radioGroupRef = ref;
                }}
                aria-label="Parent"
                name="parent"
                value={this.state.parentNr}
                onChange={this.handleParentChange.bind(this)}
            >
              {map(this.props.parentBranches, (parentBranch,index) => (
                  <FormControlLabel 
                    value={`${index}`} 
                    key={index} 
                    control={<Radio/>} 
                    label={parentBranch} 
                  />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="red">
              Delete
            </Button>}
            <Button onClick={this.props.cancelCallback} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submitCallback} color="primary">
              Add Branch
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default BranchDialog;