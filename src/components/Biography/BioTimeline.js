import React, { Component } from 'react';
import Timeline from 'react-visjs-timeline'
import moment from 'moment';
import uniq from 'lodash/uniq';
import BioEventDialog from './BioEventDialog';

class BioTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0, selectedEvent: undefined};
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  componentDidMount() {
    this.updateWindowDimensions(1.0, this.props.heightRatio);
    window.addEventListener('resize', () => this.updateWindowDimensions(1.0, this.props.heightRatio));
   }
  
   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    clearInterval(this.reRenderer);
  }
  
  updateWindowDimensions(widthRatio, heightRatio) {
    this.setState({ width: window.innerWidth * widthRatio, height: window.innerHeight*heightRatio });
  }

  openEventDialog(event) {
    this.setState({selectedEvent: event.item})
  }

  eventDialogCancelCallback() {
    this.setState({selectedEvent: undefined})
  }  

  eventDialogEditCallback(event) {
    const selectedEvent = this.state.selectedEvent;
    this.setState({selectedEvent: undefined});
    return this.props.editEventCallback(selectedEvent, event);
  } 

  eventDialogDeleteCallback() {
    this.setState({selectedEvent: undefined})
  }   

  render() {
    const options ={
      start: this.props.events.map(event => event.start).reduce((a,b) => a<b?a:b, moment().subtract(1, 'years').format('YYYY-MM-DD')),
      end: moment().add(3,'months').format('YYYY-MM-DD'),
      height: this.state.height,
      margin: {
        axis: 0,
        item: {
          horizontal: 0,
          vertical: 0
        }
      },
      stack: false,
      groupOrder: 'content'
    };    
    
    const groupNames = uniq(this.props.events.map(event => event.group))
    const groups = groupNames.map((group, index) => {
      return {
        id: index,
        content: group
      };
    });

    const subgroupNames = uniq(this.props.events.map(event => event.group))    

    const items = uniq(this.props.events.map((event, index) => {   
      return {
        //style: timelineStyle,
        id: index,
        content: !!event.logo ? `<img src=${event.logo} alt="logo" height="${this.state.height * (50/184)-20}">`:event.name,        
        start: moment(event.start, 'YYYY-MM-DD'),
        end: !!event.end ? moment(event.end, 'YYYY-MM-DD'): undefined,
        group: groupNames.indexOf(event.group),
        subgroup: event.subgroup ?subgroupNames.indexOf(event.subgroup): undefined,
        type: !!event.end ? 'range': 'point',
        title: event.title
      }
    }));  

    return (
      <div>
        <Timeline  
          groups = {groups}
          items = {items}
          options = {options}
          clickHandler={this.openEventDialog.bind(this)}
        />
        {!!this.state.selectedEvent && (
          <BioEventDialog  
            event = {this.props.events[this.state.selectedEvent]}
            deleteCallback = {this.eventDialogDeleteCallback.bind(this)}
            cancelCallback = {this.eventDialogCancelCallback.bind(this)}
            submitCallback = {this.eventDialogEditCallback.bind(this)}
          />
        )}
      </div>
    );
  }
}

export default BioTimeline;
