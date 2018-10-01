import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Branches from './components/Branches/Branches';
import LandingPage from './components/Landing/Landing';
import Diary from './components/Diary/Diary';
import Biography from './components/Biography/Biography';
import Mission from './components/Mission/Mission';
import Plan from './components/Plan/Plan';
import Settings from './components/Settings/Settings';
import Principles from './components/Principles/Principles';
import withAuthentication from './components/withAuthentication';

import * as routes from './constants/routes';


class App extends Component {
  
  render () {
    return (
      <Router>
        <div>
          <Route
            exact path={routes.LANDING}
            component={LandingPage}
          />          
          <Route
            path={`${routes.BRANCHES}/:userId?`}
            component={ Branches}
          />          
          <Route
            path={`${routes.DIARY}/:branchId/:userId?`}
            component={ Diary}
          />
          <Route
            path={`${routes.MISSION}/:branchId/:userId?`}
            component={Mission}
          />
          <Route
            path={`${routes.PLAN}/:branchId/:userId?`}
            component={Plan}
          />
          <Route
            path={`${routes.PRINCIPLES}/:branchId/:userId?`}
            render={Principles}
          />
          <Route
            path={`${routes.BIO}/:branchId/:userId?`}
            render={Biography}
          />          
          <Route
            path={`${routes.SETTINGS}/:branchId/:userId?`}
            render={Settings}
          /> 
        </div>
      </Router>
    );
  }
}

export default withAuthentication(App);