import React, { Component } from 'react';
import SignInPage from './SignIn';
import SignUpPage from './SignUp';
import Explore from './Explore';
//import Instructions from './Landing/Instructions';

class LandingPage extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="column3First">
            <SignInPage/>
          </div>
          <div className="column3">
            <SignUpPage/>
          </div>        
          <div className="column3">
            <Explore/>
          </div>
        </div>
        <div>
          <a href="https://github.com/salmituukka/diary-dashboard/blob/master/Usage.md#usage-of-learning-service">Short instructions</a>
        </div>
      </div>  
    );
  }
}

export default LandingPage;