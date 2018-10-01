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
import range from 'lodash/range';
import Highlight from './Highlight';
import Document from './Document';
import moment from 'moment';
import {db} from '../../firebase';
import {MAX_VAL, MIN_VAL} from '../../constants/timeseries';

const DOC_COULD_NOT_BE_LOADED_TEXT = '#Document could not be loaded\nYou might not have priviledges for the document.'

class Timeline extends Component {

  constructor(props) {
    super(props);
    this.state = {
        showDocument: false,
        documentTitle: '',
        markdownDocument: 'Loading document...',
        lastDrawLocation: null
    };
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
            x: date.valueOf(), y: parseInt(data, 10) + ((Math.random() - 0.5)*0.2)
          };
        })
      };
    });

    const notesY = MIN_VAL - 0.5;

    return (
      <div className = "timeline">      
        <div className = "legend">
          <DiscreteColorLegend
            maxHeight={Math.max(this.props.height-100, 350)}
            width={90}
            colors={map(series, serie => serie.color)}
            items={map(series, serie => serie.title)}
          />
        </div>
        <div className = "timeline-plot">
          <XYPlot
            margin = {{left: 50, right: 15, top: 15, bottom: 0}}
            xDomain={this.state.lastDrawLocation && [this.state.lastDrawLocation.left, this.state.lastDrawLocation.right]}
            yDomain={[MIN_VAL-1, MAX_VAL]}
            xType="time"
            width={this.props.width-120}
            height={this.props.height-100}>
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
                db.getNotes(this.props.userId, this.props.branchId, date, function(dataSnapshot) {
                  const value = dataSnapshot.val()
                  if (dataSnapshot != null) {
                    this.setState({documentTitle: `Notes ${date}`, showDocument: true, markdownDocument: value.text});
                  } else {
                    this.setState({documentTitle: `Notes ${date}`, showDocument: true, markdownDocument: DOC_COULD_NOT_BE_LOADED_TEXT});
                  }
                }.bind(this),
                function() {
                  this.setState({documentTitle: `Notes ${date}`, showDocument: true, markdownDocument: DOC_COULD_NOT_BE_LOADED_TEXT});
                }.bind(this))                                
              }}
            /> 
            <XAxis/>
            <YAxis 
              tickValues = {[notesY].concat(range(MIN_VAL, MAX_VAL+0.001))}
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
