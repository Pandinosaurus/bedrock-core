import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, Container } from 'semantic';
import Footer from 'components/Footer';
import { Layout } from 'components';
import Protected from 'components/Protected';
import Organization from 'modals/Organization';
import Sidebar from './Sidebar';
import { withSession } from 'stores';
import { userCanSwitchOrganizations } from 'utils/permissions';

import ConnectionError from 'components/ConnectionError';

import logo from 'assets/logo.svg';
import favicon from 'assets/favicon.svg';

@withSession
export default class DashboardLayout extends React.Component {
  render() {
    const { user, getOrganization } = this.context;
    return (
      <Sidebar>
        <ConnectionError />
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
                <Sidebar.Link to="/developers">
                  <Icon name="terminal" />
                  Developers
                </Sidebar.Link>
                <Sidebar.Link to="/docs">
                  <Icon name="book-open" />
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
