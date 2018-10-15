import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import * as routes from '../constants/routes';
import Menu from './Menu'
import { auth } from '../firebase';

const pathWithParam = (path, param1, param2) => 
  !!param2 ? `${path}/${param1}/${param2}`: `${path}/${param1}`;
class Navigation extends Component {
  signOut = () => {
    if (!!this.props.authUser) {
      auth.doSignOut()
    } else {
      this.props.history.push(`${routes.LANDING}`);
    }
  }  
  render() {
    const branchIds = Object.keys(this.props.branches);
    const pathParam1 = branchIds.length > 0 ? this.props.pathParam1 || branchIds[0]: this.props.pathParam1;
    return(
      <Menu>
        {!this.props.pathParam2 && 
          <a id="Branches" href={routes.BRANCHES}>Branches</a>
        }
        {(branchIds.length > 0 || this.props.pathParam2) && 
          <a id="Biography" href={pathWithParam(routes.BIO, pathParam1, this.props.pathParam2)}>Biography</a>
        }        
        {(branchIds.length > 0 || this.props.pathParam2) && 
          <a id="Mision" href={pathWithParam(routes.MISSION, pathParam1, this.props.pathParam2)}>Mission</a>
        }
        {(branchIds.length > 0 || this.props.pathParam2) && 
          <a id="Dynamics" href={pathWithParam(routes.DYNAMICS, pathParam1, this.props.pathParam2)}>Dynamics</a>
        }
        {(branchIds.length > 0 || this.props.pathParam2) && 
          <a id="Plan" href={pathWithParam(routes.PLAN, pathParam1, this.props.pathParam2)}>Plan</a>
        }
        {(branchIds.length > 0 || this.props.pathParam2) &&   
          <a id="Diary" href={pathWithParam(routes.DIARY, pathParam1, this.props.pathParam2)}>Diary</a>
        } 
        {(branchIds.length > 0 || this.props.pathParam2) &&   
          <a id="Privacy" href={pathWithParam(routes.SETTINGS, pathParam1, this.props.pathParam2)}>Privacy</a>
        }
        <a onClick={this.signOut.bind(this)} className="menu-item--small" href="">Sign out</a>
      </Menu>
    );
  }
}

export default withRouter(Navigation);