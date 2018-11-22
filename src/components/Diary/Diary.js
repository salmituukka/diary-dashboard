import React, { Component } from 'react';
import '../../App.css';
import TagCloud from './TagCloud';
import Timeline from './Timeline';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import keyBy from 'lodash/keyBy';
import moment from 'moment';
import {db} from '../../firebase';
import AddFileButton from '../AddFileButton';
import {uploadDiary} from "../../helpers/uploadHelper";
import withAuthorization from '../withAuthorization';
import Gauge from 'react-svg-gauge';
import AlertDialog from '../AlertDialog';

const NOT_TIME_SERIES_TAGS = ['tags', 'planTags', 'date', 'comments'];
const TIME_SERIES_COLORS = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#000000']

class Diary extends Component {
  componentDidMount() {
    this.metaTagListener = db.getMetaTags(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({metaTags: Object.values(values)});
      }
    }.bind(this));
    this.metaRatingListener = db.getMetaRatings(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({metaRatings: Object.values(values)});
      }
    }.bind(this));    
    this.dynamicsListener = db.getLatestDynamics(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const dynamics = dataSnapshot.val();
      if (dynamics != null) {
        this.setState({dynamics});
      }
    }.bind(this));
    this.planListener = db.getPlans(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({plans: Object.values(values)});
      }
    }.bind(this));
    this.updateWindowDimensions();
    window.addEventListener('resize', () => this.updateWindowDimensions());    
  }

  componentWillUnmount() {
    this.metaTagListener.off();
    this.metaRatingListener.off();
    this.dynamicsListener.off();
    this.planListener.off();
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  constructor(props) {
    super(props);
  
    this.state = {      
      metaTags: [],
      metaRatings: [],
      dynamics: [],
      plans: [],
      width: 0, 
      height: 0,
      dates: null,
      error: []
    };
  }

  updateWindowDimensions() {
    this.setState({ 
      width: window.innerWidth, 
      height: window.innerHeight, 
    });
  }  

  zoomCallback(zoomArea) {
    this.setState({dates: !!zoomArea ? [
      moment(zoomArea.left.valueOf()).add(1,'day').subtract(1,'second').format('YYYYMMDD'),
      moment(zoomArea.right.valueOf()).format('YYYYMMDD')
    ] : null})
  }

  diaryFilesAdded(files) {
    Promise.all(map(files, (file => uploadDiary(this.props.userId, this.props.branchId, file).catch(err => {
      if (!this.error) {
        const error = {'title': `Could not upload diary file ${file.name}`, 'description': err.message || 'Could not upload diary file'};
        this.setState({error})
      }
   }))));
  }  
  
  closeErrorDialog() {  
    this.setState({error: []})
  }   

  render() {
    const { metaTags, metaRatings, dynamics, plans } = this.state;
    const dynamicsByKey = keyBy(dynamics, o => o.diary_reference);
    const serieKeys = metaRatings ? uniq(flatten(metaRatings
      .filter(meta => !this.state.dates || (
        meta.date >= this.state.dates[0] && meta.date <= this.state.dates[1]))
      .map(meta => Object.keys(meta))))
      .filter(key => !dynamics|| !!dynamicsByKey[key])
      .filter(key => !NOT_TIME_SERIES_TAGS.includes(key)): [];
    const timelineSeries = serieKeys.map((serieKey, index) => {
      return {
        title: !!dynamicsByKey[serieKey] ? dynamicsByKey[serieKey].name: serieKey,
        comments: metaRatings.map(meta => 
          meta.comments && meta.comments[serieKey] ? meta.comments[serieKey] : null
        ),
        color: TIME_SERIES_COLORS[index % TIME_SERIES_COLORS.length],
        data: metaRatings.map(meta => meta[serieKey]),
        visible: true
      }
    });
    const metaForDates = metaRatings.length > 0 ? metaRatings: metaTags;
    const allPlanningTags = !this.state.dates ? flatten(metaTags.map(meta => meta.planTags))
                :  flatten(filter(metaTags,
                  meta => meta.date >= this.state.dates[0] && meta.date <= this.state.dates[1]
                ).map(meta => meta.planTags));
    const re = /{[^{}]*}@(?:((\w|-)+))/gm;
    const planningTagsInLatestPlan = plans.length > 0 ? plans[plans.length-1].plan.match(re).map(a => a.substring(a.indexOf('@')+1)): [];
    const numPlanningTagsInLatestPlan = filter(allPlanningTags, tag => planningTagsInLatestPlan.indexOf(tag) >= 0).length;
    const ratioOfPlanningTagsInLatestPlan = Math.round(100 * numPlanningTagsInLatestPlan / allPlanningTags.length);
    return (
      <div>    
        <div className = "row">
          <div className = "column1">
            <TagCloud 
              tags = {
                // Filter tags if timeline is zoomed
                !this.state.dates ? flatten(filter(metaTags, meta=>!!meta.tags).map(meta => meta.tags))
                :  flatten(filter(metaTags,
                  meta => meta.date >= this.state.dates[0] && meta.date <= this.state.dates[1] && !!meta.tags
                ).map(meta => meta.tags))
              }
              height = {0.45 * this.state.height}
              width = {0.7 * this.state.width} 
              title = 'What I have learnt'
            />
          </div>
          <div className = "column2">
            <div style={{position: 'absolute', right: '0px', top: '0px'}}>
              <AddFileButton 
                label="AddDay" 
                id ="add-day" 
                multipleInputs 
                submitCallback = {this.diaryFilesAdded.bind(this)}
              />
              </div>
              <div style = {{verticalAlign: 'top', marginRight: '30px', marginTop: '0px'}}>
                <div align="center">
                  <h1>Fit to plan</h1>
                </div>            
                <Gauge value={ratioOfPlanningTagsInLatestPlan} width={0.3 * this.state.width} height={(this.state.height > 300 ? 0.35: 0.45)* this.state.height} label = ''/>
            </div>
          </div>
        </div>
        <Timeline
          branchId = {this.props.branchId}
          userId = {this.props.userId}
          dates = {metaForDates.map(meta => moment(meta.date, "YYYYMMDD"))}
          series = {timelineSeries}
          height = {0.5 * this.state.height}
          width = {this.state.width} 
          zoomCallback = {this.zoomCallback.bind(this)}
        />
        <AlertDialog 
          error={this.state.error}
          id ="error-diary"
          handleClose = {this.closeErrorDialog.bind(this)}
        />              
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Diary);
