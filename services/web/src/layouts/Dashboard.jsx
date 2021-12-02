import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, Container } from 'semantic/index.js';
import Footer from 'components/Footer.jsx';
import { Layout } from 'components/index.js';
import Protected from 'components/Protected.jsx';
import Organization from 'modals/Organization.jsx';
import Sidebar from './Sidebar/index.jsx';
import { withSession } from 'stores/session.jsx';
import { userCanSwitchOrganizations } from 'utils/permissions.js';

import logo from 'assets/logo.svg';
import favicon from 'assets/favicon.svg';

class DashboardLayout extends React.Component {
  render() {
    const { user, getOrganization } = this.context;
    return (
      <Sidebar>
        <Sidebar.Menu>
          <Layout style={{ height: '100%' }}>
            <NavLink style={{ margin: '5px 25px 20px 25px' }} to="/">
              <img width="100%" src={logo} />
            </NavLink>
            <Layout vertical spread>
              {userCanSwitchOrganizations(user) && (
                <Sidebar.Item>
                  <Organization
                    trigger={
                      <div>
                        <Icon name="building" />
                        {getOrganization()?.name || 'Select Organization'}
                        <Icon name="caret-down" className="right" />
                      </div>
                    }
                    size="tiny"
                  />
                </Sidebar.Item>
              )}
              <Layout.Group>
                <Sidebar.Header>Main Menu</Sidebar.Header>
              </Layout.Group>
              <Layout.Group grow overflow>
                <Sidebar.Link to="/shops">
                  <Icon name="store" />
                  Shops
                </Sidebar.Link>
                <Sidebar.Link to="/products">
                  <Icon name="box" />
                  Products
                </Sidebar.Link>
                <Protected endpoint="users">
                  <Sidebar.Link to="/users" exact>
                    <Icon name="users" />
                    Users
                  </Sidebar.Link>
                  <Sidebar.Accordion active="/users">
                    <Sidebar.Link to="/users/invites">
                      <Icon name="envelope" />
                      Invites
                    </Sidebar.Link>
                  </Sidebar.Accordion>
                </Protected>
                <Protected endpoint="organizations">
                  <Sidebar.Link to="/organizations">
                    <Icon name="building" />
                    Organizations
                  </Sidebar.Link>
                </Protected>
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Divider />
                <Sidebar.Link to="/settings">
                  <Icon name="cog" />
                  Settings
                </Sidebar.Link>
                <Sidebar.Link to="/docs/getting-started">
                  <Icon name="terminal" />
                  Docs
                </Sidebar.Link>
                <Sidebar.Link to="/logout">
                  <Icon name="sign-out-alt" />
                  Log Out
                </Sidebar.Link>
              </Layout.Group>
            </Layout>
          </Layout>
        </Sidebar.Menu>
        <Sidebar.Content>
          <Sidebar.Mobile>
            <Layout horizontal spread center>
              <Layout.Group>
                <NavLink to="/">
                  <img src={favicon} height="15" />
                </NavLink>
              </Layout.Group>
              <Layout.Group>
                <Sidebar.Trigger>
                  <Icon name="bars" fitted />
                </Sidebar.Trigger>
              </Layout.Group>
            </Layout>
          </Sidebar.Mobile>
          <Container>
            <main>{this.props.children}</main>
            <Footer />
          </Container>
        </Sidebar.Content>
      </Sidebar>
    );
  }
}

export default withSession(DashboardLayout);