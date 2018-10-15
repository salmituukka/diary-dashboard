import React, { Component } from 'react';
import BurgerMenu from 'react-burger-menu';
import './Menu.css'

class MenuWrap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  show() {
    this.setState({hidden : false});
  }

  render() {
    let style;

    if (this.state.hidden) {
      style = {display: 'none'};
    }

    return (
      <div style={style} className={this.props.side}>
        {this.props.children}
      </div>
    );
  }
}

class Menu extends Component {
  
  constructor (props) {
    super(props);
    this.state = {
      currentMenu: 'slide'
    };
  }

  render() {
    const SideMenu = BurgerMenu[this.state.currentMenu];
    return (
      <MenuWrap>
        <SideMenu pageWrapId={'page-wrap'} outerContainerId={'outer-container'} width={ 250 }>
          {this.props.children}        
        </SideMenu>
      </MenuWrap>
    );
  }
}

export default Menu;