import React from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
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
      const allEvents = dataSnapshot.val();
      if (allEvents != null) {
        const eventGroupNames = uniq(flatten(Object.values(allEvents).map(event=>event['group'].split(','))).map(g=>g.trim()))    
        db.getFilteredEventGroups(this.props.userId, this.props.branchId, function(filtEventsSnapshot) {        
          const filteredEventGroups = filtEventsSnapshot.val() || {};
            const eventGroups = eventGroupNames.reduce((accum, evGroup) => Object.assign({}, accum, {[evGroup]: filteredEventGroups[evGroup] || false}), {})
            this.setState({
              eventGroups
            });
        }.bind(this));
        db.getFilteredPublicEventGroups(this.props.userId, this.props.branchId, function(filtEventsSnapshot) {
          const filteredEventGroups = filtEventsSnapshot.val() || {};          
          const eventGroupNames = uniq(flatten(Object.values(allEvents).map(event=>event['group'].split(','))).map(g=>g.trim()))
          const eventGroupsPublic = eventGroupNames.reduce((accum, evGroup) => Object.assign({}, accum, {[evGroup]: filteredEventGroups[evGroup] || false}), {})
          this.setState({
            eventGroupsPublic
          });
        }.bind(this));
      }
    }.bind(this));  
  }

  handleChange = (group, checked)  => {
    const {eventGroups} = this.state
    eventGroups[group] = checked
    this.setState({ eventGroups });
  };

  handleChangePublic = (group, checked)  => {
    const {eventGroupsPublic} = this.state
    eventGroupsPublic[group] = checked
    this.setState({ eventGroupsPublic });
  };

  handleSubmit = () => {
    const {eventGroups, eventGroupsPublic} = this.state
    return Promise.all([db.putFilteredEventGroups(this.props.userId, this.props.branchId, eventGroups),
      db.putFilteredPublicEventGroups(this.props.userId, this.props.branchId, eventGroupsPublic)
    ]).catch(err => {
      const error = {'title': `Could not filtered event groups`, 'description': err.message || 'Could not edit filtered event groups'};
      this.setState({error});
    });
  }  
  
  closeErrorDialog() {  
    this.setState({error: []})
  }  

  render() {
    const {eventGroups, eventGroupsPublic} = this.state;
    return (
      <div className="row">
        <div className="column">
          <FormLabel component="legend">{'Hidden event groups'}</FormLabel>
          <GridList cols={1} cellHeight='auto'>            
            {Object.entries(eventGroups).map(entry => (
              <ListItem key={entry[0]}>
                  <Checkbox checked={entry[1]} value={entry[0]} onChange={(event, check) => this.handleChange(entry[0], check)}/>
                  {entry[0]}
              </ListItem>
            ))}
          </GridList>
        </div>
        <div className="column">
          <FormLabel component="legend">{'Hidden public event groups'}</FormLabel>
          <GridList cols={1} cellHeight='auto'>            
            {Object.entries(eventGroupsPublic).map(entry => (
              <ListItem key={entry[0]}>
                  <Checkbox checked={entry[1]} value={entry[0]} onChange={(event, check) => this.handleChangePublic(entry[0], check)}/>
                  {entry[0]}
              </ListItem>
            ))}
          </GridList> 
        </div>     
        <div align="center">    
          <Button variant="contained" color="primary" onClick={this.handleSubmit}>
            Submit
          </Button>  
                        
          <AlertDialog 
              error={this.state.error}
              id ="error-ev-grup-filter"
              handleClose = {this.closeErrorDialog.bind(this)}
          />  
        </div>       
      </div>
    );
  }
}

export default EventGroups;