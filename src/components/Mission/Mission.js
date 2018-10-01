import React, { Component } from 'react';
import AddTextButton from './AddTextButton';
import Paper from '@material-ui/core/Paper';
import {db} from '../../firebase';
import withAuthorization from '../withAuthorization';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AlertDialog from '../AlertDialog';

const defaultMissionText = 'No mission yet!';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});

class Mission extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      missions: [{
        date: null,
        mission: defaultMissionText
      }],
      error: []
    };
  }  

  componentDidMount() {
    db.getMissions(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({missions: Object.values(values)});
      }
    }.bind(this));
  }

  submitCallback(text) {
    const mission = {
      date: moment().format('YYYYMMDD'),
      mission: text
    };
    return db.putMission(this.props.userId, this.props.branchId, mission).catch(err => {
      const error = {'title': 'Could not upload mission', 'description': err.message || 'Could not upload mission'};
      this.setState({error})
    });
  }  

  closeErrorDialog() {  
    this.setState({error: []})
  }  

  render() {
    return (
      <div>
        <AddTextButton 
          label="AddMission" 
          id ="add-mission"
          submitCallback = {this.submitCallback.bind(this)}
        /> 
        <div class="center">
          <article align="center">
            <header>
              <h1>Mission</h1>
            </header>
          </article>        
          <Paper elevation={1} className={this.props.classes.root}>
            <Typography variant="headline" component="h3">
              {this.state.missions[0].mission}
            </Typography> 
          </Paper> 
        </div>
        <AlertDialog 
          error={this.state.error}
          id ="error-mission"
          handleClose = {this.closeErrorDialog.bind(this)}
        />        
      </div>
    );
  }
}

Mission.propTypes = {
  classes: PropTypes.object.isRequired,
};


const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(withStyles(styles)(Mission));