import React from 'react';
import bem from 'helpers/bem.jsx';

class SidebarLayoutItem extends React.Component {
  render() {
    return <div className={this.getBlockClass()} {...this.props} />;
  }
}

export default bem(SidebarLayoutItem);