import React, { Component } from 'react';
import Graph from 'vis-react';

class BioTimelinePlayer extends Component {
  constructor() {
    this.time = undefined;
    this.speed = 1;
  }
  updateCurrentEvent() {
    
  }
  render() {
    const { events } = this.props;
    this.time = this.time || events[0].start;
    return (
      <div></div>
    );
  }
}