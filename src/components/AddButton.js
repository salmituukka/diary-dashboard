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

class AddButton extends Component {  
  render() {
    return (
      <Button onClick = {this.props.onClick} variant="fab" color="primary" component="span" className={this.props.classes.button} aria-label={this.props.label}>
        <AddIcon />
      </Button>
    )
  }
}

AddButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddButton);