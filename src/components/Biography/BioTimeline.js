import React, { Component } from 'react';
import Timeline from 'react-visjs-timeline'
import moment from 'moment';
import uniq from 'lodash/uniq';
import keyBy from 'lodash/keyBy';
import flatten from 'lodash/flatten';
import BioEventDialog from './BioEventDialog';

const maxNumberOfEvents = 10000;

class BioTimeline extends Component {
  timelineRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = { 
      start: undefined,
      end: undefined,
      width: 0, 
      height: 0, 
      selectedEvent: undefined
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  componentDidMount() {
    this.updateWindowDimensions(1.0, this.props.heightRatio);
    window.addEventListener('resize', () => this.updateWindowDimensions(1.0, this.props.heightRatio));
   }
  
   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions(widthRatio, heightRatio) {
    this.setState({ width: window.innerWidth * widthRatio, height: window.innerHeight*heightRatio });
  }

  openEventDialog(event) { 
    const valid = event.event.timeStamp > (this.rangeChangedTimestamp + 100 || 0);
    if (!!event && event.item !== undefined && event.item !== null && valid) {
      this.setState({selectedEvent: event.item % maxNumberOfEvents})
    }
  }

  rangechangedHandler(event) {
    try {
      this.rangeChangedTimestamp = event.event.srcEvent.timeStamp  
    } 
    catch (error) {
      this.rangeChangedTimestamp = 0
    }
    const items = this.getItems(moment(event.start), moment(event.end))
    this.timelineRef.current.$el.setItems(items)
    this.start = this.timelineRef.current.$el.range.start
    this.end = this.timelineRef.current.$el.range.end
    //this.setState({start: moment(event.start), end: moment(event.end)});
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

  componentDidUpdate(prevProps) {
    if (!!prevProps && this.props.heightRatio !== prevProps.heightRatio) {
      this.updateWindowDimensions(1.0, this.props.heightRatio);
    }
    
    if (!!this.start && prevProps === this.props) {
      this.timelineRef.current.$el.setWindow(this.start, this.end)  
    } else {
      this.timelineRef.current.$el.fit({animation: {duration: 2000}});              
    }
/*
    if (!this.state.selectedEvent) {
      if (prevState.selectedEvent) {
        this.timelineRef.current.$el.fit({animation: {duration: 1000}});
      }
      else {
        this.timelineRef.current.$el.fit({animation: {duration: 2000}});        
      }
    }*/
  }

  getItems(startTime, endTime) {
    const suppressMode = this.state.height < 150;    
    const groupNames = uniq(flatten(this.props.events.map(event => event.group.split(','))))
      .filter(group => this.props.hiddenGroups.indexOf(group) < 0);    
    const groupHeight = (numSubgroups) => Math.max(5, this.state.height * (60/184) *3 /(groupNames.length * numSubgroups) -20 + (numSubgroups-1)*4);
    const contentWithoutImage = (content, size) => `<div>${content}<img src=${require('../../images/heart.png')} alt ="" width =0 height="${groupHeight(size||1)}"></div>`;
    const dummyContent = (numSubgroups) => `<div><img src=${require('../../images/heart.png')} alt ="" width =0 height="${groupHeight(numSubgroups)}"></div>`;

    const eventsWithId = this.props.events.map((event, index) => {
      event['id'] = index; 
      return event;
    });

    const overlappingEvents = groupNames.map(group => eventsWithId.filter(event =>event.group.split(",").indexOf(group) >=0))
      .map(groupEvents=>groupEvents.filter(event => !!event.end && !!event.subgroup && event.subgroup.length > 0)
        .map(event => groupEvents.filter(other => event.start <= other.start && event.end >= other.start)).filter(events => events.length > 1).map(events => 
          keyBy(events.map((other, index) => { 
            return {id: other.id, index: index, size: events.length}
          }),  o=>
          {
            return o.id
          }))
      ).map(a=>{
        return a.reduce((val1,val2) => Object.assign({}, val1, val2), {});
      });

    const minDistance = isFinite(endTime) ? moment(endTime).diff(moment(startTime), 'days') / this.state.width * groupHeight(1): 10;
    const closeEvents = groupNames.map(group => eventsWithId.filter(event =>event.group.split(",").indexOf(group) >=0))
    .map(groupEvents=>groupEvents
        .filter(event => !event.end && groupEvents.map(other => event.start < other.start && other.start.diff(event.start, 'days') < minDistance && other !== event).some(a=>a)))

    const items = uniq(flatten(this.props.events
      .map((event, index) => 
        event.group.split(',').filter( group => this.props.hiddenGroups.indexOf(group) < 0)
          .map((group, indexInGroup) => {
          const groupIndex = groupNames.indexOf(group)
          const subgroupIndex = overlappingEvents[groupIndex] && overlappingEvents[groupIndex][index] ? overlappingEvents[groupIndex][index].index: undefined
          const size = overlappingEvents[groupIndex] && overlappingEvents[groupIndex][index] ? overlappingEvents[groupIndex][index].size: 1
          const closeEvent = closeEvents[groupIndex].indexOf(event) >= 0
          return {
            //style: timelineStyle,
            id: index + maxNumberOfEvents * indexInGroup,
            content: closeEvent ?dummyContent(size):!!event.logo ? '<div>'+event.logo.split(',+,').map(logo=>`<img src=${logo} alt="logo" height="${groupHeight(size)}">`)+'</div>':contentWithoutImage(event.name, size),
            start: event.start, 
            end: event.end,
            group: groupNames.indexOf(group),
            subgroup: subgroupIndex,
            //subgroup: event.subgroup ?subgroupNames.indexOf(event.subgroup): undefined,
            type: !!event.end ? 'range': 'point',
            title: !!event.logo ? '<div>'+event.title+'</p>'+event.logo.split(',+,').map(logo=>`<img src=${logo} alt="logo" height="${groupHeight(size)}">`)+'</div>':contentWithoutImage(event.name),
            style: (!!event.subgroup && !!event.end? 'background-color: rgba(193,201,226,0.6);'	:'') + (suppressMode ? `font-size:${Math.floor(8/size)}px`: `font-size:${Math.floor(14/size)}px`)
          
      }}))))
      return items;    
  }

  render() {    
    const suppressMode = this.state.height < 150;    
    const options = {
      locale: 'en',
      start: moment(),
      end: this.state.selectedEvent >= 0? this.props.events[this.state.selectedEvent].start.add(1,'day'): moment().add(1,'week'),
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
      showMajorLabels: false,
      zoomMin:1000*60*60*24*7, // one week
      zoomMax:1000*60*60*24*365.25*100 // 100 years
    };
    const groupNames = uniq(flatten(this.props.events.map(event => event.group.split(','))))
      .filter(group => this.props.hiddenGroups.indexOf(group) < 0);    
    const groupHeight = (numSubgroups) => Math.max(5, this.state.height * (60/184) *3 /(groupNames.length * numSubgroups) -20 + (numSubgroups-1)*4);
    const contentWithoutImage = (content) => `<div>${content}<img src=${require('../../images/heart.png')} alt ="" width =0 height="${groupHeight(1)}"></div>`;


    const groups = groupNames.map((group, index) => {
      return {
        id: index,
        content: contentWithoutImage(group),
        style: suppressMode ? 'font-size:8px': 'font-size:14px'
      };
    })

    const eventsWithId = this.props.events.map((event, index) => {
      event['id'] = index; 
      return event;
    });

    const evStarts = flatten(groupNames.map(group => eventsWithId.filter(event =>event.group.split(",").indexOf(group) >=0))).map(ev=>ev.start)
    const evEnds = flatten(groupNames.map(group => eventsWithId.filter(event =>event.group.split(",").indexOf(group) >=0))).map(ev=>ev.end)
    const startTime = Math.min(...evStarts)
    const endTime = Math.max(...evStarts, ...evEnds)

    const items = this.getItems(startTime, endTime)
    
    return (
      <div>        
        <Timeline
          ref = {this.timelineRef}
          groups = {groups}
          items = {items}
          options = {options}
          clickHandler={this.openEventDialog.bind(this)}
          rangechangedHandler={this.rangechangedHandler.bind(this)}
        />
        {this.state.selectedEvent !== undefined && (
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
