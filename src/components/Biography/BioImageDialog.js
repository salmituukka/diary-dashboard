import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import pick from 'lodash/pick';

class BioImageDialog extends Component {  
  
  constructor(props) {
    super(props);
    this.state = {
      image: '',
      text: '',
    }; 
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  state2image = () => {
    var image = pick(this.state, ['image', 'text']);
    return image;
  }

  validateFields = () => 
    !!this.state.image;

  submitCallback = () => {
    if (this.validateFields()) {
      this.props.submitCallback(
        this.state2image());
    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };  
    
  componentDidMount() {
    if (!!this.props.image) {  
      this.setState({image: this.props.image.image, text: this.props.image.text});
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
              value={this.state.image}
              onChange={this.handleChange('image')}
              id = "image_url"
              label = "Image URL"
              type = "text"
              required = {true}
              fullWidth
            />
            <TextField
              value={this.state.text}
              onChange={this.handleChange('text')}
              id = "image_text"
              label = "Hello text"
              type = "text"
              required = {false}
              multiline = {true}
              rows = {1}
              rowsMax = {10}               
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            {this.props.deleteCallback &&
            <Button onClick={this.props.deleteCallback} color="red">
              Delete
            </Button>}
            <Button onClick={this.submitCallback} color="primary">
              Edit image
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

export default BioImageDialog;