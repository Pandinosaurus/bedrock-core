import React from 'react';
import bem from 'helpers/bem.jsx';

class SidebarLayoutAccordion extends React.Component {
  getModifiers() {
    const active = location.pathname.startsWith(this.props.active);
    return [active ? 'active' : null];
  }

  render() {
    return <div className={this.getBlockClass()}>{this.props.children}</div>;
  }
}

export default bem(SidebarLayoutAccordion);
