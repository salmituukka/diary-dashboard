import React, { Component } from 'react';
import {db} from '../../firebase';
import DynamicsDialog from './DynamicsDialog';
import AddButton from '../AddButton';
import Graph from 'vis-react';
import moment from 'moment';
import map from 'lodash/map';
import toPairs from 'lodash/toPairs';
import flatten from 'lodash/flatten';
import mean from 'lodash/mean';
import {MAX_VAL, MIN_VAL} from '../../constants/timeseries';
import withAuthorization from '../withAuthorization';
import AlertDialog from '../AlertDialog';

class MentalDynamics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metas: [],   
      dynamics: [],
      dynamicDialogOpen: false,
      modifiedDynamic: '',
      error: []
    };
  }

  componentDidMount() {
    this.metaListener = db.getMetaRatings(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        this.setState({metas: Object.values(values)});
      }
    }.bind(this));
    this.dynamicsListener = db.getLatestDynamics(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const dynamics = dataSnapshot.val();
      if (dynamics != null) {
        this.setState({dynamics});
      }
    }.bind(this));    
  }

  componentWillUnmount() {
    this.metaListener.off();
    this.dynamicsListener.off();
  }  

  addCallback(dynamics) {
    this.setState({modifiedDynamic: '', dynamicDialogOpen: false});
    dynamics = Object.assign(dynamics, {type: 'ADD', time: moment().format('YYYYMMDDhhmmss')});    
    return db.postLatestDynamics(this.props.userId, this.props.branchId, dynamics).then(ref =>
      db.postDynamicsEvent(this.props.userId, this.props.branchId, ref.key, dynamics)).catch(err => {
        const error = {'title': 'Could not add node', 'description': err.message || 'Could not add node'};
        this.setState({error})
      });
  }

  modifyCallback(dynamics) {
    const id = this.state.modifiedDynamic;
    this.setState({modifiedDynamic: '', dynamicDialogOpen: false});
    dynamics = Object.assign(dynamics, {type: 'MODIFY', time: moment().format('YYYYMMDDhhmmss')});
    db.putLatestDynamics(this.props.userId, this.props.branchId, id, dynamics).then(() =>
      db.postDynamicsEvent(this.props.userId, this.props.branchId, id, dynamics))
    .catch(err => {
      const error = {'title': 'Could not modify node', 'description': err.message || 'Could not modify node'};
      this.setState({error})
    });
  }

  deleteCallback(dynamics) {
    const id = this.state.modifiedDynamic;
    this.setState({modifiedDynamic: '', dynamicDialogOpen: false});
    dynamics = Object.assign(dynamics, {type: 'DELETE', time: moment().format('YYYYMMDDhhmmss')});

    db.deleteLatestDynamics(this.props.userId, this.props.branchId, id).then(() =>
      db.postDynamicsEvent(this.props.userId, this.props.branchId, id, dynamics)
    ).catch(err => {
      const error = {'title': 'Could not delete node', 'description': err.message || 'Could not delete node'};
      this.setState({error})
    });
  }
  
  cancelCallback() {
    this.setState({modifiedDynamic: '', dynamicDialogOpen: false});
  } 

  openDialog() {
    this.setState({dynamicDialogOpen: true});
  }

  closeErrorDialog() {  
    this.setState({error: []})
  }

  render() {
    const { metas, dynamics } = this.state;

    var nodes = map(toPairs(dynamics), 
      (idPrinciple) => {
        const meanVal = (mean(
          metas.map(meta => meta[idPrinciple[1].diary_reference])
            .filter(val => !!val)
            .map(val => parseInt(val, 10))
        )-MIN_VAL)/(MAX_VAL-MIN_VAL);
        const rgbVals = meanVal > 0.5 ? 
          [meanVal * 255, 255, 0]
          : (meanVal < 0.5) ?
            [255, meanVal * 255, 0]
            : [255, 255, 0];        
        return {
          id: idPrinciple[0],
          label: idPrinciple[1].name,
          title: idPrinciple[1].comment || undefined,
          shape: 'circle',
          color: `rgb(${rgbVals[0]}, ${rgbVals[1]}, ${rgbVals[2]})`,
          scaling: {
            min: 10,
            max: 1000,
            label: {
              enabled: true,
              min: 6
            }
          },
          value: 8* window.innerWidth / Math.pow(idPrinciple[1].name.length, 2),
          mass: 4
        };
      }
    );
    const edges = flatten(map(toPairs(dynamics),
      (idDynamic) => 
        map(idDynamic[1].positive_parents, parent => {
          return {
            from: parent, 
            to: idDynamic[0],
            arrows: {to: {enabled: true}},
            color: 'green'
          };
        }).concat(map(idDynamic[1].negative_parents, parent => {
          return {
            from: parent, 
            to: idDynamic[0],
            arrows: {to: {enabled: true}},
            color: 'red'
          };
        }))       
    ));
    const events = {
      doubleClick: function(event) {
        if (event.nodes.length === 1)
        {
          this.setState({dynamicDialogOpen: true, modifiedDynamic: event.nodes[0]});
        }
      }.bind(this)
    }
    const graph = {
      nodes,
      edges
    };
    const dynamicDialogProps = this.state.modifiedDynamic ? {
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Modify node ${dynamics[this.state.modifiedDynamic].name}`,
      submitCallback: this.modifyCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      deleteCallback: this.deleteCallback.bind(this),
      dynamics: dynamics[this.state.modifiedDynamic],
      nodes: map(toPairs(dynamics), (idPrinciple) => {
        return {
          key: idPrinciple[0],
          name: idPrinciple[1].name
        };
      })
    }            
    :{
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Add new node`,
      submitCallback: this.addCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      dynamics: {
        name: '',
        comment: '',
        diary_reference: '',
        positive_parents: '',
        negative_parents: ''
      },
      nodes: map(toPairs(dynamics), (idPrinciple) => {
        return {
          key: idPrinciple[0],
          name: idPrinciple[1].name
        };
      })      
    };

    return (
      <div>
        <div className="center">
          <Graph
            graph={graph}
            events = {events}
            options= {{
                width: `${window.innerWidth}px`,
                height: `${window.innerHeight}px`}}
            />
        </div>
        <AddButton onClick = {this.openDialog.bind(this)}/>
        {this.state.dynamiceDialogOpen && (
          <DynamicsDialog          
            {...dynamicDialogProps}
          />
        )}
        <AlertDialog 
          error={this.state.error}
          id ="error-dynamic"
          handleClose = {this.closeErrorDialog.bind(this)}
        />               
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(MentalDynamics);