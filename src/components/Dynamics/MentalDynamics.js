import React, { Component } from 'react';
import {db} from '../../firebase';
import DynamicsDialog from './DynamicsDialog';
import AddButton from '../AddButton';
import Graph from 'vis-react';
import moment from 'moment';
import map from 'lodash/map';
import keys from 'lodash/keys';
import toPairs from 'lodash/toPairs';
import flatten from 'lodash/flatten';
import zipWith from 'lodash/zipWith';
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
      error: [],
      estimatedDynamics: [],
      edgeColorByValues:false
    };
  }

  componentDidMount() {
    this.metaListener = db.getMetaRatings(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const values = dataSnapshot.val();
      if (values != null) {
        // Count only last month
        this.setState({metas: Object.values(values).filter(val => moment().subtract(30, 'days') < moment(val.date, "YYYYMMDD"))});
        if (this.state.dynamics.length > 0) {
          this.estimateDynamics();
        }
      }
    }.bind(this));
    this.dynamicsListener = db.getLatestDynamics(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const dynamics = dataSnapshot.val();
      if (dynamics != null) {
        Object.keys(dynamics).forEach(key => {
          dynamics[key].positive_parents = dynamics[key].positive_parents || [];
          dynamics[key].negative_parents = dynamics[key].negative_parents || [];
          dynamics[key].parents = dynamics[key].parents || [];
        });
        this.setState({dynamics});
        if (this.state.metas.length > 0) {
          this.estimateDynamics();
        }        
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

  estimateDynamics() {
    /*UGGLY FAST EXPERIMENTAL SOLUTION
    This could be probabably replaced with HMM
    */ 
    const {metas, dynamics} = this.state;

    const timeDecay = 0.92;
    const timeDecayScaling = metas.map(meta => timeDecay ** moment().diff(moment(meta.date, "YYYYMMDD"), 'days')).reduce((a,b) => a+b, 0);
    const getNodeVals = (node, estimatedVals, metas) => {      
      const valsWithWeights = zipWith(metas.map(meta => meta[node.diary_reference])
        .filter(val => !!val)
        .map(val => (parseInt(val, 10)-MIN_VAL)/(MAX_VAL-MIN_VAL)-0.5),
        metas.filter(meta => !!meta[node.diary_reference]).map(meta => timeDecay ** moment().diff(moment(meta.date, "YYYYMMDD"), 'days')),
        (a,b) => {
          return {
            val:a, weight:b
          };
        });
      const weight = valsWithWeights.map(a=>a.weight).reduce((a,b)=>a+b,0) /timeDecayScaling;
      const meanVal = valsWithWeights.map((a) => a.weight*a.val).reduce((a,b)=>a+b,0) /(weight* timeDecayScaling) || 0;      
      const ready = weight > 0.99;
      const totalWeight = Object.values(node.parents).reduce((a,b) => a+Math.abs(b.weight) / node.parent_explanation, 0);
      const parentVal = keys(node.parents).map(parent => {
        return !!estimatedVals[parent] ? {
          val: (estimatedVals[parent].val) * estimatedVals[parent].weight * node.parents[parent].weight/totalWeight,
          weight: estimatedVals[parent].weight * Math.abs(node.parents[parent].weight) / totalWeight,
          ready: estimatedVals[parent].ready,
        }: {val:0, weight:0,ready:false};
      }).reduce((a, b) => {
        return {
          val: a.val + b.val,
          weight: a.weight + b.weight,
          ready: a.ready && b.ready,
        };
      }, {val: 0, weight: 0, ready: true});
      return {
        val: Math.min(0.5, Math.max(-0.5, meanVal+parentVal.val)), 
        weight: Math.min(1,weight + parentVal.weight), 
        ready: ready || parentVal.ready
      };
    }


    
    const metric = (a, metas) => toPairs(a.parents).map((parent_id, parent) => parent.weight
            * (!dynamics[parent_id] ? [0]
            : metas.filter(meta => !!meta[dynamics[parent_id].diary_reference]).map(meta => timeDecay ** moment().diff(moment(meta.date, "YYYYMMDD"), 'days'))))
            .reduce((a,b)=>a+b,0)*a.parent_explanation

    //const ratioOfRatedDays = (a, metas) => metas.map(meta => meta[a.diary_reference]).filter(val => !!val).length / metas.length;
    //const metric = (a, metas) => a.parents.map(parent => parent.weight).reduce((a,b)=>a+b,0)*a.parent_explanation - ratioOfRatedDays(a, metas)
    const sortedPairs = toPairs(dynamics).sort((a,b) => metric(a[1], metas) - metric(b[1], metas));
    const estimatedRounds = 5;
    const estimatedDynamics = {}
    for (var round = 0; round < estimatedRounds; round++) {
      sortedPairs.forEach(a => {
        if (!estimatedDynamics[a[0]] ||  !estimatedDynamics[a[0]].ready) {
          estimatedDynamics[a[0]] = getNodeVals(a[1], estimatedDynamics, metas);
        }
      });
    }    

    // Define whether node is "positive" or not
    const successors = {};
    Object.keys(dynamics).forEach(key=>{
      Object.keys(dynamics[key].parents).forEach(parent => successors[parent] = !!successors[parent] 
        ? Object.assign({[key]:dynamics[key].parents[parent].weight}, successors[parent])
        : {[key]: dynamics[key].parents[parent].weight});
      //dynamics[key].positive_parents.forEach(parent => positive_successors[parent] = !!positive_successors[parent] ? positive_successors[parent].concat(key): [key]);
      //dynamics[key].negative_parents.forEach(parent => negative_successors[parent] = !!negative_successors[parent] ? negative_successors[parent].concat(key): [key]);
    });

    const maxDepth = 5;
    const stepsToTarget = (key, depth) => {
      if (depth > 0) {
        if (dynamics[key].target) {
          return 0;
        } else {
          // Not very effective way
          return !!successors[key] ? 
            1+Math.min(...(Object.keys(successors[key]) || []).map(b=>stepsToTarget(b, depth - 1)))
            :1000
        }
      }
      return 10000;
    }
    const pairsSortedByStepsToTarget = toPairs(dynamics).sort((a,b) => stepsToTarget(a[0], maxDepth) - stepsToTarget(b[0], maxDepth));

    pairsSortedByStepsToTarget.forEach(a => {
      if (a[1].target) {
        estimatedDynamics[a[0]].positive = true;
      } else {
        estimatedDynamics[a[0]].positive = (!!successors[a[0]] 
          ? Object.keys(successors[a[0]])
          .filter(node => estimatedDynamics[node].positive !== undefined)
          .map(node=>successors[a[0]][node])
          .reduce((a,b)=>a+b,0)
          >= 0: true)
      }
    });
    this.setState({estimatedDynamics});
  }

  render() {
    const { dynamics, estimatedDynamics } = this.state;

    var nodes = map(toPairs(dynamics), 
      (idPrinciple) => {   
        var meanVal = !!estimatedDynamics[idPrinciple[0]] ? (estimatedDynamics[idPrinciple[0]].val)*estimatedDynamics[idPrinciple[0]].weight + 0.5: 0.5;
        if (!!estimatedDynamics[idPrinciple[0]] && !estimatedDynamics[idPrinciple[0]].positive) {
          meanVal = 1 - meanVal;
        }
        const rgbVals = meanVal > 0.5 ? 
          [(2-meanVal*2) * 255, 255, 0]
          : (meanVal < 0.5) ?
            [255, 2 * meanVal * 255, 0]
            : [255, 255, 0];
        return {
          /*shapeProperties: {
            borderDashes: true
          },*/
          borderWidth: idPrinciple[1].target ? 5:1,
          id: idPrinciple[0],
          label: idPrinciple[1].name,
          title: `${idPrinciple[1].comment} (${parseInt(meanVal*100,10)}%)`,
          shape: 'circle',
          color: {
            background: `rgb(${rgbVals[0]}, ${rgbVals[1]}, ${rgbVals[2]})`,
            border: `#2B7CE9`,
          },
         // color: `rgb(${rgbVals[0]}, ${rgbVals[1]}, ${rgbVals[2]})`,
            
          scaling: {
            min: 10,
            max: 1000,
            label: {
              enabled: true,
              min: 10
            }
          },
          value: 8* window.innerWidth / Math.pow(idPrinciple[1].name.length, 0.05),
          mass: 15
        };
      }
    );
    const edges = flatten(map(toPairs(dynamics),
      (idDynamic) => 
        map(Object.keys(idDynamic[1].parents).filter(parent => !!dynamics[parent]), parent => {
          const meanVal = !!estimatedDynamics[parent] ? estimatedDynamics[parent].val+0.5: 0.5;
          const totalWeight = Object.values(idDynamic[1].parents)
            .reduce((a,b) => a+Math.abs(b.weight) / idDynamic[1].parent_explanation, 0);
          const width = Math.max(1,(Math.abs(idDynamic[1].parents[parent].weight)
            /totalWeight)*32);
          const opacity = Math.max(0.2,(!!estimatedDynamics[parent]  ? estimatedDynamics[parent].weight: 0.5));
          const rgbValsByWeight = [
            127.5 - 127.5 * Math.sign([idDynamic[1].parents[parent].weight]),
            127.5 + 127.5 * Math.sign([idDynamic[1].parents[parent].weight]),
            0];
          const rgbValsByValues = (meanVal > 0.5 ? 
          [meanVal * 255, 255, 0]
          : (meanVal < 0.5) ?
            [255, meanVal * 255, 0]
            : [255, 255, 0]);
          const rgbVals = this.state.edgeColorByValues ? rgbValsByValues: rgbValsByWeight;
          return {
            arrowStrikethrough: false,
            width: width,
            from: parent, 
            title: !!idDynamic[1].parents[parent].description ? `${idDynamic[1].parents[parent].description} (${(idDynamic[1].parents[parent].weight/totalWeight).toFixed(2)})`
              : (idDynamic[1].parents[parent].weight/totalWeight).toFixed(2),
            to: idDynamic[0],
            arrows: {to: {enabled: true}},
            //color: `green`
            color: `rgba(${rgbVals[0]}, ${rgbVals[1]}, ${rgbVals[2]},${opacity})`
          };
        })
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
        {this.state.dynamicDialogOpen && (
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