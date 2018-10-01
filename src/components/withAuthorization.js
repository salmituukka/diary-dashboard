import React from 'react';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './AuthUserContext';
import BranchContext from './BranchContext';
import { firebase } from '../firebase';
import * as routes from '../constants/routes';
import Navigation from './Navigation';
import BranchMenu from './BranchMenu';

const withAuthorization = (authCondition) => (Component, disableBranchMenu) => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => {
        if (!authCondition(authUser) && !this.props.match.params.userId) {
          this.props.history.push(routes.LANDING);
        } 
      });
    }

    render() {
      return (
        <BranchContext.Consumer>
          {branches =>
            <AuthUserContext.Consumer>
              {authUser => authUser || this.props.match.params.userId ? 
                <div>
                  <Navigation 
                    pathParam1 = {this.props.match.params.branchId}
                    pathParam2 = {this.props.match.params.userId}
                    branches = {branches}
                    authUser = {authUser}
                  /> 
                  <Component 
                    userId = {this.props.match.params.userId || authUser.uid}
                    userName = {!!authUser ? authUser.displayName || authUser.email: ''}
                    branchId = {this.props.match.params.branchId}
                    key = {this.props.match.params.branchId}
                    branches = {branches}
                  /> 
                  {(!disableBranchMenu 
                    && !this.props.match.params.userId 
                    && Object.keys(branches).length > 0) 
                    && (
                      <div className = "top-center">
                        <BranchMenu 
                          branches = {branches} 
                          activeBranch = {this.props.match.params.branchId}
                        />
                      </div>
                  )}                  
                </div>
              : null}
            </AuthUserContext.Consumer>
          }
        </BranchContext.Consumer>
      );
    }
  }

  return withRouter(WithAuthorization);
}
export default withAuthorization;
