import React from 'react';
import bem from 'helpers/bem.jsx';

class SidebarLayoutMobile extends React.Component {
  render() {
    return <div className={this.getBlockClass()}>{this.props.children}</div>;
  }
}

export default bem(SidebarLayoutMobile);
