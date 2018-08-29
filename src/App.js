import React, { Component } from 'react';
import './App.css';
import TagCloud from './components/TagCloud';
import Timeline from './components/Timeline';
import flatten from 'lodash/flatten';
import moment from 'moment';
import fire from './firebase/firebase';

class App extends Component {
  componentDidMount() {
    this.diaryMetasRef = fire.database().ref('diary_metas').orderByChild("date");
    this.diaryMetasRef.on("child_added", function(dataSnapshot) {
      this.setState({ metas: this.state.metas.concat([dataSnapshot.val()])});
    }.bind(this));
  }

  componentWillUnmount() {
    this.diaryMetasRef.off();
  }

  constructor(props) {
    super(props);
  
    this.state = {      
      metas: [],
      dates: null
    };   
  }

  zoomCallback(zoomArea) {
    this.setState({dates: !!zoomArea ? [
      moment(zoomArea.left.valueOf()).format('YYYYMMDD'),
      moment(zoomArea.right.valueOf()).format('YYYYMMDD')
    ] : null})
  }
  
  render() {
    const timelineSeries= {
      studies: {
        title: 'Study progress',
        color: 'red',
        data: this.state.metas.map(meta => meta.studies),
        visible: true
      },
      vibes: {
        title: 'Vibe',
        color: 'blue',
        data: this.state.metas.map(meta => meta.vibe),
        visible: true
      }
    }
    return (
      <div>
        <TagCloud 
          tags = {
            // Filter tags if timeline is zoomed
            !this.state.dates ? flatten(this.state.metas.map(meta => meta.tags))
            :  flatten(this.state.metas.filter(
              meta => meta.date >= this.state.dates[0] && meta.date <= this.state.dates[1]
            ).map(meta => meta.tags))
          }
          heightRatio = {0.5} 
        />
      <Timeline
        dates = {this.state.metas.map(meta => moment(meta.date, "YYYYMMDD"))}
        series = {timelineSeries}
        heightRatio = {0.5} 
        zoomCallback = {this.zoomCallback.bind(this)}
      /> 
      </div>
    );
  }
}

export default App;
