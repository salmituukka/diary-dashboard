import React, { Component } from 'react';
import Fab from '@material-ui/core/Fab';
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
      <Fab onClick = {this.props.onClick} color="primary" component="span" className={this.props.classes.button} aria-label={this.props.label}>
        <AddIcon />
      </Fab>
    )
  }
}

AddButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddButton);