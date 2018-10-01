import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { auth } from '../../firebase';
import * as routes from '../../constants/routes';
import username2FakeEmail from '../../helpers/authHelper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';

const SignInPage = ({ history }) =>
  <div align = "center">
    <h1>SignIn</h1>
    <SignInForm history={history} />
  </div>

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

const INITIAL_STATE = {
  usernameOrEmail: '',
  password: '',
  error: null,
};

class SignInForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  handleSubmit = (event) => {
    const {
      usernameOrEmail,
      password,
    } = this.state;

    const {
      history,
    } = this.props;

    const email = usernameOrEmail.indexOf('@')>0 
      ? usernameOrEmail
      : username2FakeEmail(usernameOrEmail);

    auth.doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        history.push(routes.HOME);
      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
  }

  render() {
    const {
      usernameOrEmail,
      password,
      error,
    } = this.state;

    const isInvalid =
      password === '' ||
      usernameOrEmail === '';


    return (
      <div align = "center">
        <FormControl component="fieldset" margin = "normal">
          <div align = "left">
            <FormGroup >
              <TextField
                onChange={event => this.setState(byPropKey('usernameOrEmail', event.target.value))}
                id="usernameOrEmail"
                type="text"
                placeholder="Email or username"
              />
              <br/>  
              <TextField
                inputRef={text => this.password = text}
                onChange={event => this.setState(byPropKey('password', event.target.value))}
                id="password"
                type="password"
                placeholder="password"
              />          
              <br/>
              <Button disabled={isInvalid} variant="contained" color="primary" onClick={this.handleSubmit}>
                Sign in
              </Button>   
            </FormGroup>        
          </div>
        </FormControl>
        { error && <p>{error.message}</p> }  
      </div>
    );
  }
}

export default withRouter(SignInPage);

export {
  SignInForm,
};