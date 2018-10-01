import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class PrincipleDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      principle: '',
      comment: '',
      diary_id: ''
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };


  submitCallback = () => {
    if (this.principle != null && this.principle.value != null) {
      this.props.submitCallback(
        this.principle.value, 
        this.comment != null ? this.comment.value: '', 
        this.id.value != null ? this.id.value: ''
      );
    }
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
              inputRef={text => this.principle = text}
              margin = "dense"
              id = "principle"
              label = "Principle"
              type = "text"
              required = {true}
              defaultValue = {this.props.principle.principle}
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
              defaultValue = {this.props.principle.comment}
              fullWidth
            />
            <TextField
              inputRef={text => this.id = text}
              margin = "dense"
              id = "diary_id"
              label = "ID in diary"
              type = "text"
              required = {false}
              defaultValue = {this.props.principle.diary_reference}
              fullWidth
            />            
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
              Add Principle
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default PrincipleDialog;