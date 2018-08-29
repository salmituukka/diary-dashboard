import React, { Component } from 'react';
import {
  XYPlot, 
  XAxis, 
  YAxis, 
  HorizontalGridLines, 
  MarkSeries, 
  LineMarkSeries, 
  DiscreteColorLegend,
} from 'react-vis/dist';
import zipWith from 'lodash/zipWith';
import map from 'lodash/map';
import Highlight from './Highlight';
import Document from './Document';
import moment from 'moment';
import fire from '../firebase/firebase';
class Timeline extends Component {

  constructor(props) {
    super(props);
    this.storage = fire.storage();
    this.state = {
        showDocument: false,
        documentTitle: '',
        markdownDocument: 'Loading document...',
        width: 0, 
        height: 0,
        lastDrawLocation: null
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions(this.props.heightRatio);
    window.addEventListener('resize', () => this.updateWindowDimensions(this.props.heightRatio));
   }

   componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions(heightRatio) {
    this.setState({ 
      width: window.innerWidth, 
      height: window.innerHeight * heightRatio, 
      });
  }

  documentClosed() {
    this.setState({showDocument: false});
  }  
  
  render() {
    const series = map(this.props.series, serie => {
      return {
        color: serie.color,
        title: serie.title,
        visbile: serie.visible,
        data: zipWith(this.props.dates, serie.data, (date, data) => {
          return {
            x: date.valueOf(), y: data
          };
        })
      };
    });

    const notesY = 3.5;

    return (
      <div className = "timeline">      
        <div className = "legend">
          <DiscreteColorLegend
            height={100}
            width={100}
            colors={map(series, serie => serie.color)}
            items={map(series, serie => serie.title)}
          />
        </div>
        <div className = "timeline-plot">
          <XYPlot
            margin = {{left: 50, right: 10, top: 10, bottom: 40}}
            xDomain={this.state.lastDrawLocation && [this.state.lastDrawLocation.left, this.state.lastDrawLocation.right]}
            yDomain={[3, 10]}
            xType="time"
            width={this.state.width-100}
            height={this.state.height-100}>
            <Highlight
              onBrushEnd={(area) => {
                this.setState(
                  { lastDrawLocation: area }
                )
                this.props.zoomCallback(area);
              }}
            />
            {map(series, serie => (
              <LineMarkSeries
                style={{
                  strokeWidth: '3px'
                }}
                lineStyle={{stroke: serie.color}}
                markStyle={{stroke: serie.color, fill: serie.color}}
                size = {5}
                data={serie.data}
                getNull={(d) => !!d.y}
                key={serie.title}         
              />
            ))}                    
            <MarkSeries
              style={{stroke: 'red', fill: 'orange'}}
              size= {10}
              data={map(this.props.dates, date => {
                return {
                  x: date.valueOf(),
                  y: notesY,
                };
              })}
              onValueClick={(datapoint)=>{
                const date = moment(datapoint.x).format('YYYYMMDD');
                this.documentRef = fire.database().ref('diary_bodies').orderByChild("date").equalTo(date)
                this.documentRef.on("child_added", function(dataSnapshot) {
                  this.setState({documentTitle: `Notes ${date}` , showDocument: true, markdownDocument: dataSnapshot.val().text});
                }.bind(this));                  
              }}
            />           
            <XAxis/>
            <YAxis 
              tickValues = {[notesY, 4, 5, 6, 7, 8, 9, 10]}
              tickTotal = {8}
              tickFormat = {v => v === notesY ? `Notes`: v}
              />
            <HorizontalGridLines />  
          </XYPlot>  
        </div>      
        {this.state.showDocument && (
          <Document          
            markdownDocument = {this.state.markdownDocument}
            title = {this.state.documentTitle}
            documentClosedCallback = {this.documentClosed.bind(this)}
          />
        )}        
      </div>                
    );
  }
}

export default Timeline;
