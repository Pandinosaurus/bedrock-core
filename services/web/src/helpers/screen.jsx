import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'utils/env.js';
import { wrapComponent, getWrappedComponent } from 'utils/hoc.js';

import PortalLayout from 'layouts/Portal.jsx';
import DashboardLayout from 'layouts/Dashboard.jsx';

// Note: Ideally the screen helper would be agnostic to specific
// layouts and instead allow them to be defined by an app wiring
// them together, however react-hot-reloader has issues with this.
const layouts = {
  portal: PortalLayout,
  dashboard: DashboardLayout,
};

export default function (Component) {
  const Wrapped = getWrappedComponent(Component);
  const title = Wrapped.title || startCase(Wrapped.name.replace(/Screen$/, ''));
  const Layout = layouts[Wrapped.layout || 'dashboard'] || nullLayout;

  class Screen extends React.PureComponent {
    render() {
      return (
        <React.Fragment>
          <Helmet>
            {this.renderTitle()}
            {this.renderCanonical()}
          </Helmet>
          <Layout>
            <Component {...this.props} />
          </Layout>
        </React.Fragment>
      );
    }

    renderTitle() {
      const parts = [];
      parts.push(Component.title || title);
      parts.push(APP_NAME);
      return <title>{parts.join(' | ')}</title>;
    }

    renderCanonical() {
      return <link rel="canonical" href={location.href} />;
    }
  }
  return wrapComponent(Component, Screen);
}

function nullLayout(props) {
  return props.children;
}