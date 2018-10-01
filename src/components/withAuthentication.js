import React from 'react';

import { firebase, db } from '../firebase';
import AuthUserContext from './AuthUserContext';
import BranchContext from './BranchContext';
const withAuthentication = (Component) => 
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: null,
        branches: []
      };
    }

    componentDidMount() {
      firebase.auth.onAuthStateChanged(authUser => { 
        if (authUser) {
          this.setState({ authUser });
          this.branchListener = db.getBranches(authUser.uid, function(dataSnapshot) {
            const branches = dataSnapshot.val();
            if (branches != null) {
              this.setState({branches});
            }
          }.bind(this));              
        } else {
          this.setState({ authUser: null});
        }
      });
    }

    componentWillUnmount() {
      if (!!this.branchListener) {
        this.branchListener.off();
      }
    }      

    render() {
      const { authUser, branches } = this.state;
      return (
        <BranchContext.Provider value={branches}>
          <AuthUserContext.Provider value={authUser}>
            <Component />
          </AuthUserContext.Provider>
        </BranchContext.Provider>
      );
    }
  }
export default withAuthentication;