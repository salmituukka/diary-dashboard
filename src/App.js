import React, { Component, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import MentalDynamics from './components/Dynamics/MentalDynamics';
import withAuthentication from './components/withAuthentication';

import * as routes from './constants/routes';
import './App.css';

const Branches = lazy(() => import('./components/Branches/Branches'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const Diary = lazy(() => import('./components/Diary/Diary'));
const Plan = lazy(() => import('./components/Plan/Plan'));
const LandingPage = lazy(() => import('./components/Landing/Landing'));
const Mission = lazy(() => import('./components/Mission/Mission'));
const Biography = lazy(() => import('./components/Biography/Biography'));
//const MentalDynamics = lazy(() => import('./components/Dynamics/MentalDynamics'));

class App extends Component {
  
  render () {
    return (
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
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
            path={`${routes.DYNAMICS}/:branchId/:userId?`}
            component={MentalDynamics}
          />
          <Route
            path={`${routes.BIO}/:branchId/:userId?`}
            component={Biography}
          />          
          <Route
            path={`${routes.SETTINGS}/:branchId/:userId?`}
            component={Settings}
          /> 
        </div>
        </Suspense>
      </Router>
    );
  }
}

export default withAuthentication(App);