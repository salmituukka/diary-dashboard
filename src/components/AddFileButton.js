import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
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


class AddFileButton extends Component {  
  render() {
    var inputParams = {
      accept: this.props.extension || ".md",
      className: this.props.classes.input,
      id: this.props.id,      
      type: "file",
      onChange:(e) => this.props.submitCallback(e.target.files),
    };
    if (this.props.multipleInputs) {
      inputParams['multiple'] = true;
    }
    return (
      <div>
        <input
          {...inputParams}
        />
        <label htmlFor={this.props.id}>
          <Button variant="fab" color="primary" component="span" className={this.props.classes.button} aria-label={this.props.label}>
            <AddIcon />
          </Button>
        </label>
      </div>
    )
  }
}

AddFileButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddFileButton);