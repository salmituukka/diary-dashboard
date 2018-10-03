import React, { Component } from 'react';
import AddFileButton from '../AddFileButton';
import Paper from '@material-ui/core/Paper';
import {db} from '../../firebase';
import renderHTML from 'react-render-html';
import * as showdown from 'showdown';
import {githubTemplate, replaceTagsByColor} from '../../helpers/htmlHelper';
import {uploadPlan} from "../../helpers/uploadHelper";
import flatten from 'lodash/flatten';
import countBy from 'lodash/countBy';
import filter from 'lodash/filter';
import moment from 'moment';
import map from 'lodash/map';
import withAuthorization from '../withAuthorization';
import AlertDialog from '../AlertDialog';

const defaultPlanText = "You haven't specify your plan yet."

class Plan extends Component {
  constructor(props) {
    super(props);
    this.state = {      
      plans: [{
        date: null,
        plan: defaultPlanText,
        metas: []
      }],
      error: []
    };
    this.converter = new showdown.Converter();
  }  

  componentDidMount() {
    this.metaTagListener = db.getMetaTags(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({metas: Object.values(values)});
      }
    }.bind(this));    
    this.planListener = db.getPlans(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({plans: Object.values(values)});
      }
    }.bind(this));
    window.addEventListener('resize', () => this.updateWindowDimensions(this.props.heightRatio));
  }

  updateWindowDimensions(heightRatio) {
    this.setState({ 
      width: window.innerWidth, 
      height: window.innerHeight * heightRatio, 
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    this.metaTagListener.off();;
    this.planListener.off();    
  }  

  submitCallback(file) {
    uploadPlan(this.props.userId, this.props.branchId, file[0]).catch(err => {
      const error = {'title': 'Could not upload plan', 'description': err.message || 'Could not upload plan'};
      this.setState({error})
    });
  }  

  closeErrorDialog() {  
    this.setState({error: []})
  }  

  render() {
    const { metas, plans } = this.state;
    const tagCounts = countBy(flatten(map(metas, meta => meta.planTags)));
    const tagCountsUsedWithinWeek = countBy(
      flatten(
        map(
          filter(
            metas, meta => moment().diff(moment(meta.date, "YYYYMMDD"), 'days') < 7
          ), 
          meta => meta.planTags
        )
      )
    );
    return (
      <div>
        <AddFileButton 
          label="AddPlan" 
          id ="add-plan"
          submitCallback = {this.submitCallback.bind(this)}
        /> 
        <div className = "center-50">
          <Paper elevation={1} style={
            {
              maxHeight: this.state.height *0.8, 
              overflow: 'auto'
            }}>
            <article align="center">
              <h1>Plan</h1>
            </article>
            {renderHTML(
              githubTemplate(
                replaceTagsByColor(
                  this.converter.makeHtml(
                    plans[plans.length-1].plan
                  ),
                  tagCounts,
                  tagCountsUsedWithinWeek
                )
              )
            )}
          </Paper>
        </div>
        <AlertDialog 
          error={this.state.error}
          id ="error-plan"
          handleClose = {this.closeErrorDialog.bind(this)}
        />        
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Plan);