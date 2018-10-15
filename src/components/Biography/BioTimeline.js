import React, { Component } from 'react';
import Timeline from 'react-visjs-timeline'
import moment from 'moment';
import uniq from 'lodash/uniq';
import keyBy from 'lodash/keyBy';
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
    const selectedEvent = this.state.selectedEvent;
    this.setState({selectedEvent: undefined});
    return this.props.deleteEventCallback(selectedEvent);
  }   

  rangeChangeHandler(event) {
    this.setState({start: event.start, end: event.end});
  }

  componentDidUpdate(prevProps) {
    if (!!prevProps && this.props.heightRatio !== prevProps.heightRatio) {
      this.updateWindowDimensions(1.0, this.props.heightRatio);
    }
    if (!!prevProps && (this.props.events.length > 0 && prevProps.events.length === 0)) {
      this.setState({
        start: this.props.events.map(event => event.start).reduce((a,b) => a<b?a:b, moment().subtract(1, 'years')),
        end: moment().add(3,'months').format('YYYY-MM-DD')
      });
    }
  }

  render() {    
    const suppressMode = this.state.height < 150;
    const options = {
      start: this.state.start,
      end: this.state.end,
      height: this.state.height,
      margin: {
        axis: 25,
        item: {
          horizontal: 0,
          vertical: 0
        }
      },
      stack: false,
      groupOrder: 'content',
      showMajorLabels: false
    };    

    const groupNames = uniq(this.props.events.map(event => event.group));
    const groupHeight = (numSubgroups) => Math.max(5, this.state.height * (60/184) *3 /groupNames.length / numSubgroups -20);
    const contentWithoutImage = (content) => `<div>${content}<img src=${require('../../images/heart.png')} alt ="" width =0 height="${groupHeight(1)}"></div>`;
    const groups = groupNames.map((group, index) => {
      return {
        id: index,
        content: contentWithoutImage(group),
        style: suppressMode ? 'font-size:8px': 'font-size:14px',
      };
    });    

    const eventsWithId = this.props.events.map((event, index) => {
      event['id'] = index; 
      return event;
    });

    const overlappingEvents = groupNames.map(group => eventsWithId.filter(event =>event.group === group))
      .map(groupEvents=>groupEvents.filter(event => !!event.end && !!event.subgroup && event.subgroup.length > 0)
        .map(event => groupEvents.filter(other => event.start <= other.start && event.end >= other.start)).filter(events => events.length > 1).map(events => 
          keyBy(events.map((other, index) => { return {id: other.id, index: index, size: events.length}}),  o=>o.id))
      ).map(a=>!!a?a[0]:a);

    const items = uniq(this.props.events
      .map((event, index) => {
        const groupIndex = groupNames.indexOf(event.group)
        const subgroupIndex = overlappingEvents[groupIndex] && overlappingEvents[groupIndex][index] ? overlappingEvents[groupIndex][index].index: undefined
        const size = overlappingEvents[groupIndex] && overlappingEvents[groupIndex][index] ? overlappingEvents[groupIndex][index].size: 1
        return {
          //style: timelineStyle,
          id: index,
          content: !!event.logo ? `<img src=${event.logo} alt="logo" height="${groupHeight(size)}">`:contentWithoutImage(event.name),
          start: moment(event.start, 'YYYY-MM-DD'),
          end: !!event.end ? moment(event.end, 'YYYY-MM-DD'): undefined,
          group: groupNames.indexOf(event.group),
          subgroup: subgroupIndex,
          //subgroup: event.subgroup ?subgroupNames.indexOf(event.subgroup): undefined,
          type: !!event.end ? !!event.subgroup ? 'range': 'range': 'point',
          title: event.title,
          style: suppressMode ? 'font-size:8px': 'font-size:14px'
        }
      })
    );  

    return (
      <div>
        <Timeline  
          groups = {groups}
          items = {items}
          options = {options}
          clickHandler={this.openEventDialog.bind(this)}
          rangechangedHandler={this.rangeChangeHandler.bind(this)}
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
