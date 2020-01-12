import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PrivacySettings from './PrivacySettings';
import EventGroups from './EventGroups'
import withAuthorization from '../withAuthorization';

const styles = theme => ({
  root: {
    flexGrow: 10,
    backgroundColor: theme.palette.background.paper,
    marginLeft: '200px'
  },
});

class Settings extends React.Component {
  state = {
    activeTab: 0,
  };

  handleChange = (event, activeTab) => {
    this.setState({ activeTab });
  };

  render() {
    const { classes } = this.props;
    const { activeTab } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Tabs value={activeTab} onChange={this.handleChange}>
            <Tab label="Privacy settings" />
            <Tab label="Event group settings" />
          </Tabs>
        </AppBar>
        {activeTab === 0 && <PrivacySettings userId = {this.props.userId} userName = {this.props.userName} branchId = {this.props.branchId}/>}
        {activeTab === 1 && <EventGroups userId = {this.props.userId} userName = {this.props.userName} branchId = {this.props.branchId}/>}
      </div>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
};

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(withStyles(styles)(Settings));