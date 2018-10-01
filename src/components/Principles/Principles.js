import React, { Component } from 'react';
import {db} from '../../firebase';
import PrincipleDialog from './PrincipleDialog';
import AddButton from '../AddButton';
import Graph from 'vis-react';
import moment from 'moment';
import map from 'lodash/map';
import toPairs from 'lodash/toPairs';
import keys from 'lodash/keys';
import mean from 'lodash/mean';
import {MAX_VAL, MIN_VAL} from '../../constants/timeseries';
import withAuthorization from '../withAuthorization';
import AlertDialog from '../AlertDialog';

class Principles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metas: [],   
      principles: [],
      principleDialogOpen: false,
      modifiedPrinciple: '',
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
    this.principleListener = db.getLatestPrinciples(this.props.userId, this.props.branchId, function(dataSnapshot) {
      const principles = dataSnapshot.val();
      if (principles != null) {
        this.setState({principles});
      }
    }.bind(this));    
  }

  componentWillUnmount() {
    this.metaListener.off();
    this.principleListener.off();
  }  

  addCallback(text, comment, diary_reference) {
    this.setState({modifiedPrinciple: '', principleDialogOpen: false});
    const principle = {
      type: 'ADD',
      principle: text,
      comment,
      diary_reference,
      time: moment().format('YYYYMMDDhhmmss')
    };
    return db.postLatestPrinciple(this.props.userId, this.props.branchId, principle).then(ref =>
      db.postPrincipleEvent(this.props.userId, ref.key, this.props.branchId, principle)).catch(err => {
        const error = {'title': 'Could not add principle', 'description': err.message || 'Could not add principle'};
        this.setState({error})
      });
  }

  modifyCallback(text, comment, diary_reference) {
    const id = this.state.modifiedPrinciple;
    this.setState({modifiedPrinciple: '', principleDialogOpen: false});
    const principle = {
      type: 'MODIFY',
      principle: text,
      comment,
      diary_reference,
      time: moment().format('YYYYMMDDhhmmss')
    };

    db.putLatestPrinciple(this.props.userId, this.props.branchId, id, principle).then(() =>
      db.postPrincipleEvent(this.props.userId, this.props.branchId, id, principle))
    .catch(err => {
      const error = {'title': 'Could not modify principle', 'description': err.message || 'Could not modify principle'};
      this.setState({error})
    });
  }

  deleteCallback(text, comment, diary_reference) {
    const id = this.state.modifiedPrinciple;
    this.setState({modifiedPrinciple: '', principleDialogOpen: false});
    const principle = {
      type: 'DELETE',
      principle: text,
      comment,
      diary_reference,
      time: moment().format('YYYYMMDDhhmmss')
    };

    db.deleteLatestPrinciple(this.props.userId, this.props.branchId, id).then(() =>
      db.postPrincipleEvent(this.props.userId, this.props.branchId, id, principle)
    ).catch(err => {
      const error = {'title': 'Could not delete principle', 'description': err.message || 'Could not delete principle'};
      this.setState({error})
    });
 
  }
  
  cancelCallback(text, comment, diary_reference) {
    this.setState({modifiedPrinciple: '', principleDialogOpen: false});
  } 

  openDialog() {
    this.setState({principleDialogOpen: true});
  }

  closeErrorDialog() {  
    this.setState({error: []})
  }

  render() {
    const { metas, principles } = this.state;

    var nodes = map(toPairs(principles), 
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
          label: idPrinciple[1].principle,
          title: idPrinciple[1].comment,
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
          value: 8* window.innerWidth / Math.pow(idPrinciple[1].principle.length, 2),
          mass: 4
        };
      }
    );
    nodes.push({
      id: 'root',
      label: !!this.props.branches[this.props.branchId] ? this.props.branches[this.props.branchId].name : 'Principles',
      shape: 'circle',
      fixed: {x: true, y:true},
      x: window.innerWidth/2,
      y: window.innerHeight/2,
      scaling: {
        min: 10,
        max: 1000,
        label: {
          enabled: true
        }
      },
      value: window.innerWidth/3,
      mass: 4
    });
    const edges = map(keys(principles),
      (id) => {
        return {
          from: 'root', 
          to: id,
          arrows: {to: {enabled: false}} // undirected edge
        };
      }
    );
    const events = {
      doubleClick: function(event) {
        if (event.nodes.length === 1 && event.nodes[0] !== 'root')
        {
          this.setState({principleDialogOpen: true, modifiedPrinciple: event.nodes[0]});
        }
      }.bind(this)
    }
    const graph = {
      nodes,
      edges
    };
    const principleDialogProps = this.state.modifiedPrinciple ? {
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Modify principle ${principles[this.state.modifiedPrinciple].principle}`,
      submitCallback: this.modifyCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      deleteCallback: this.deleteCallback.bind(this),
      principle: principles[this.state.modifiedPrinciple]
    }            
    :{
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Add new principle`,
      submitCallback: this.addCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      principle: {
        principle: '',
        comment: '',
        diary_reference: ''
      }
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
        {this.state.principleDialogOpen && (
          <PrincipleDialog          
            {...principleDialogProps}
          />
        )}
        <AlertDialog 
          error={this.state.error}
          id ="error-principle"
          handleClose = {this.closeErrorDialog.bind(this)}
        />               
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Principles);