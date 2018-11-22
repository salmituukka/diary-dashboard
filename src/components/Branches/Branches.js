import React, { Component } from 'react';
import {db} from '../../firebase';
import BranchDialog from './BranchDialog';
import AddButton from '../AddButton';
import Graph from 'vis-react';
import moment from 'moment';
import map from 'lodash/map';
import toPairs from 'lodash/toPairs';
import keys from 'lodash/keys';
import withAuthorization from '../withAuthorization';
import AlertDialog from '../AlertDialog';

class Branches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchDialogOpen: false,
      modifiedBranch: '',
      error: []
    };
  }

  closeErrorDialog() {  
    this.setState({error: []})
  }     

  addCallback(name, comment, parentNr) {
    const ids = keys(this.props.branches).filter(key=>key !== this.state.modifiedBranch);
    parentNr = parseInt(parentNr,10);
    const parentId = parentNr === 0 ? 'root': ids[parentNr-1];
    
    this.setState({modifiedBranch: '', branchDialogOpen: false});
    const branch = {
      name,
      comment,
      parentId,
      createdAt: moment().format('YYYYMMDDhhmmss')
    };
    return db.postBranch(this.props.userId, branch).catch(err => {
      const error = {'title': `Could not add branch`, 'description': err.message || 'Could not add branch'};
      this.setState({error})
    });
  }

  modifyCallback(name, comment, parentNr) {
    const ids = keys(this.props.branches).filter(key=>key !== this.state.modifiedBranch);
    parentNr = parseInt(parentNr,10);
    const parentId = parentNr === 0 ? 'root': ids[parentNr-1];

    const id = this.state.modifiedBranch;
    this.setState({modifiedBranch: '', branchDialogOpen: false});
    const branch = {
      name,
      comment,
      parentId, 
    };

    db.putBranch(this.props.userId, id, branch).catch(err => {
      const error = {'title': `Could not modify branch`, 'description': err.message || 'Could not modify branch'};
      this.setState({error});
    });
  }

  deleteCallback() {
    const id = this.state.modifiedBranch;
    this.setState({modifiedBranch: '', branchDialogOpen: false});
    db.deleteBranch(this.props.userId, id).catch((err) => {
      const error = {'title': `Could not delete branch`, 'description': err.message || 'Could not delete branch'};
      this.setState({error});
    });    
  }
  
  cancelCallback() {
    this.setState({modifiedBranch: '', branchDialogOpen: false});
  } 

  openDialog() {
    this.setState({branchDialogOpen: true});
  }

  render() {
    const { branches } = this.props;

    var nodes = map(toPairs(branches), 
      (idBranch) => {    
        return {
          id: idBranch[0],
          label: idBranch[1].name,
          title: idBranch[1].comment,
          shape: 'circle',
          color: `green`,
          scaling: {
            min: 10,
            max: 1000,
            label: {
              enabled: true,
              min: 6
            }
          },
          value: 8* window.innerWidth / Math.pow(idBranch[1].name.length, 2),
          mass: 4
        };
      }
    );
    const rootNode = {
      id: 'root',
      label: 'My life',
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
    };
    nodes.push(rootNode);
    const edges = map(keys(branches),
      (id) => {
        return {
          from: branches[id].parentId, 
          to: id,
          arrows: {to: {enabled: false}} // undirected edge
        };
      }
    );
    const events = {
      doubleClick: function(event) {
        if (event.nodes.length === 1 && event.nodes[0] !== 'root')
        {
          this.setState({branchDialogOpen: true, modifiedBranch: event.nodes[0]});
        }
      }.bind(this)
    }
    const graph = {
      nodes,
      edges
    };
    const branchDialogProps = this.state.modifiedBranch ? {
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Modify branch ${branches[this.state.modifiedBranch].name}`,
      submitCallback: this.modifyCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      deleteCallback: this.deleteCallback.bind(this),
      branch: branches[this.state.modifiedBranch],
      parentBranches: [rootNode.label].concat(
        toPairs(branches).filter(idBranch => idBranch[0] !== this.state.modifiedBranch)
        .map(idBranch => idBranch[1].name))      
    }            
    :{
      label: 'ModifyNode',
      id: 'modify-node',
      dialogTitle: `Add new branch`,
      submitCallback: this.addCallback.bind(this),
      cancelCallback: this.cancelCallback.bind(this),
      branch: {
        name: '',
        comment: '',
        parentNr: '',
      },
      parentBranches: [rootNode.label].concat(
        toPairs(branches).filter(idBranch => idBranch[0] !== this.state.modifiedBranch)
        .map(idBranch => idBranch[1].name))
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
        {this.state.branchDialogOpen && (
          <BranchDialog          
            {...branchDialogProps}
          />
        )}
        <AlertDialog 
          error={this.state.error}
          id ="error-branches"
          handleClose = {this.closeErrorDialog.bind(this)}
        />                 
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(Branches, true);