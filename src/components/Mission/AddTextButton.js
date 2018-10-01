import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  button: {
    //margin: theme.spacing.unit,
    float: 'right',
  },
  input: {
    display: 'none',
  },
}); 

class AddTextButton extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {      
      open: false
    };    
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  cancelCallback = () => {
    this.setState({ open: false });
  };

  submitCallback = () => {
    this.setState({ open: false });
    if (this.text != null && this.text.value != null) {
      this.props.submitCallback(this.text.value);
    }
  };  
    
  render() {
    return (
      <div>
       <Dialog
          open={this.state.open}
          aria-labelledby="form-dialog-title"
          fullScreen
        >
          <DialogTitle id="form-dialog-title">Set new mission</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.props.dialogText}
            </DialogContentText>
            <TextField
              inputRef={text => this.text = text}
              autoFocus
              margin = "dense"
              id = "mission"
              label = "Mission"
              type = "text"
              multiline = {true}
              rows = {1}
              rowsMax = {15}
              fullWidth
              required = {true}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelCallback} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submitCallback} color="primary">
              Add mission
            </Button>
          </DialogActions>
        </Dialog>
          <Button onClick={this.handleClickOpen} variant="fab" color="primary" component="span" className={this.props.classes.button} aria-label={this.props.label}>
            <AddIcon />
        </Button>
      </div>
    )
  }
}

AddTextButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddTextButton);