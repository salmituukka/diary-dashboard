import React from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import pick from 'lodash/pick';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import AlertDialog from '../AlertDialog';

import { db } from '../../firebase';


class EventGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventGroups: {},
      eventGroupsPublic: {},
      error: []
    };
  }

  componentDidMount() {
    db.getLatestBioEvents(this.props.userId, this.props.branchId, function(dataSnapshot) {
      db.getFilteredEventGroups(this.props.userId, this.props.branchId, function(filtEventsSnapshot) {
        const allEvents = dataSnapshot.val();
        const filteredEventGroups = filtEventsSnapshot.val() || [];
        
        if (allEvents != null) {
          const eventGroupNames = uniq(flatten(Object.values(allEvents).map(event=>event['group'].split(','))))
          const eventGroups = eventGroupNames.reduce((accum, evGroup) => Object.assign({}, accum, {[evGroup]: filteredEventGroups.indexOf(evGroup) > 0}), {})
          this.setState({
            eventGroups
          });
        }
      }.bind(this));
      db.getPublicFilteredEventGroups(this.props.userId, this.props.branchId, function(filtEventsSnapshot) {
        const allEvents = dataSnapshot.val();
        const filteredEventGroups = filtEventsSnapshot.val() || [];
        
        if (allEvents != null) {
          const eventGroupNames = uniq(flatten(Object.values(allEvents).map(event=>event['group'].split(','))))
          const eventGroupsPublic = eventGroupNames.reduce((accum, evGroup) => Object.assign({}, accum, {[evGroup]: filteredEventGroups.indexOf(evGroup) > 0}), {})
          this.setState({
            eventGroupsPublic
          });
        }
      }.bind(this));        
    }.bind(this));  
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  
  closeErrorDialog() {  
    this.setState({error: []})
  }  

  render() {
    const {eventGroups} = this.state;
    return (
      <div align = "center">
        <FormLabel component="legend">{'Hidden event groups'}</FormLabel>
        <GridList disablePadding={true} cols={1} cellHeight='auto' style={{overflow:'hidden'}}>            
          {Object.entries(eventGroups).map(entry => (
            <ListItem style={{direction:'ltr', left:0, height:40}}>
                <Checkbox checked={entry[1]} value={entry[0]} onChange={(event, check) => this.handleChange(entry[0], check)}/>
                {entry[0]}
            </ListItem>
          ))}
        </GridList>
        <FormLabel component="legend">{'Hidden public event groups'}</FormLabel>
        <GridList disablePadding={true} cols={1} cellHeight='auto' style={{overflow:'hidden'}}>            
          {Object.entries(eventGroupsPublic).map(entry => (
            <ListItem style={{direction:'ltr', left:0, height:40}}>
                <Checkbox checked={entry[1]} value={entry[0]} onChange={(event, check) => this.handleChange(entry[0], check)}/>
                {entry[0]}
            </ListItem>
          ))}
        </GridList>            
        <AlertDialog 
            error={this.state.error}
            id ="error-ev-grup-filter"
            handleClose = {this.closeErrorDialog.bind(this)}
        />         
      </div>
    );
  }
}

export default EventGroups;