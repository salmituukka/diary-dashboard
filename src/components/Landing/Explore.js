import React, { Component } from 'react';
import { 
  withRouter,
 } from 'react-router-dom';
import { db } from '../../firebase';

import * as routes from '../../constants/routes';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import toPairs from 'lodash/toPairs';

const Explore = ({ history }) =>
  <div align = "center">
    <h1>Explore public branches</h1>
    <ExploreForm history={history}/>
  </div>

const INITIAL_STATE = {
  publicBranches: [],
  error: null,
};

class ExploreForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  componentDidMount() {
    db.getPublicBranches(function(dataSnapshot) {
      const publicBranches= dataSnapshot.val();
      if (publicBranches != null) {
        this.setState({
          publicBranches,
        });
      }
    }.bind(this),(err) => {
      console.error(err);
    });  
  }

  handleListItemClick = (event, userId, branchId) => {
    const {
      history,
    } = this.props;

    this.setState({ ...INITIAL_STATE });
    history.push(`${routes.BIO}/${branchId}/${userId}`);
    event.preventDefault();
  }

  render() {
    const {
      publicBranches,
      error,
    } = this.state;

    return (
      <div>
      <List component="nav">
        {toPairs(publicBranches).map((keyAccount,index) => (
          <ListItem
            key={index}
            button
            selected={this.state.selectedIndex === index}
            onClick={event => this.handleListItemClick(event, keyAccount[1].userId, keyAccount[0])}>
          <ListItemText primary={keyAccount[1].name} />
          </ListItem>
        ))}
      </List>
      { error && <p>{error.message}</p> }  
      </div>
  );
}
}

export default withRouter(Explore);

export {
  Explore
};