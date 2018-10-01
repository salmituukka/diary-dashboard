import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import map from 'lodash/map';
import toPairs from 'lodash/toPairs';
import { 
  withRouter,
 } from 'react-router-dom';

class BranchMenu extends React.Component {
  constructor(props) {
    super(props);  
    this.state = {
      activeBranch: -1,
      anchorEl: null
    };
  } 

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = (newBranch) => {
    this.setState({ anchorEl: null });
    if (typeof(newBranch) === "string") {
      const { history, location, activeBranch } = this.props;
      history.push(location.pathname.replace(activeBranch, newBranch));
    }
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div align = "center">
        <Button
          aria-owns={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          Branch: {this.props.branches[this.props.activeBranch].name}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
        {map(toPairs(this.props.branches), (idBranch, index) => 
          <MenuItem key = {index} onClick={() => this.handleClose(idBranch[0])}>{idBranch[1].name}</MenuItem>
        )}
        </Menu>
      </div>
    );
  }
}
export default withRouter(BranchMenu);

export {
  BranchMenu
};