import React, { useContext } from 'react';
import { merge, omit } from 'lodash';
import { withRouter } from 'react-router-dom';
import { request, getToken, setToken, clearToken } from 'utils/api/index.js';
import { trackSession } from 'utils/analytics/index.js';
import { captureError } from 'utils/sentry.js';
import { wrapContext } from 'utils/hoc.js';

const SessionContext = React.createContext();

class SessionProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: true,
      stored: this.loadStored(),
      organization: null,
    };
  }

  componentDidMount() {
    this.load();
    this.attachHistory();
  }

  componentDidCatch(error) {
    captureError(error);
    this.setState({
      error,
    });
  }

  isAdmin = () => {
    return this.hasRoles(['admin']);
  };

  hasRoles = (roles = []) => {
    const { user } = this.state;
    return roles.some((role) => {
      return user?.roles.includes(role);
    });
  };

  hasRole = (role) => {
    return this.hasRoles([role]);
  };

  setToken = (token) => {
    if (token) {
      setToken(token);
    } else {
      clearToken();
    }
  };

  load = async () => {
    if (getToken()) {
      this.setState({
        loading: true,
        error: null,
      });
      try {
        const { data: user } = await request({
          method: 'GET',
          path: '/1/users/me',
        });
        const organization = await this.loadOrganization();
        // Uncomment this line if you want to set up
        // User-Id tracking. https://bit.ly/2DKQYEN.
        // setUserId(data.id);
        this.setState({
          user,
          organization,
          loading: false,
        });
      } catch (error) {
        this.setState({
          error,
          loading: false,
        });
      }
    } else {
      this.setState({
        user: null,
        loading: false,
      });
    }
  };

  reloadUser = async () => {
    const { data } = await request({
      method: 'GET',
      path: '/1/users/me',
    });
    this.setState({
      user: data,
    });
  };

  updateUser = (data) => {
    this.setState({
      user: merge({}, this.state.user, data),
    });
  };

  clearUser = () => {
    this.setState({
      user: null,
      error: null,
    });
  };

  // Authentication

  logout = async (capture) => {
    if (capture) {
      const { pathname, search } = window.location;
      this.setStored('redirect', pathname + search);
    }
    try {
      await request({
        method: 'POST',
        path: '/1/auth/logout',
      });
    } catch (err) {
      // JWT token errors may throw here
    }
    this.setToken(null);
    document.location = '/';
  };

  authenticate = async (token) => {
    this.setToken(token);
    await this.load();
    return this.popStored('redirect') || '/';
  };

  // Organizations

  loadOrganization = async () => {
    const organizationId = this.state.stored['organizationId'];
    if (organizationId) {
      try {
        const { data } = await request({
          method: 'GET',
          path: `/1/organizations/${organizationId}`,
        });
        return data;
      } catch (err) {
        if (err.status < 500) {
          this.removeStored('organizationId');
        }
      }
    }
  };

  setOrganization = (organization) => {
    if (organization) {
      this.setStored('organizationId', organization.id);
    } else {
      this.removeStored('organizationId');
    }
    // Organizations may affect the context of all pages as well as
    // persistent header/footer so need to do a hard-reload of the app.
    window.location.reload();
  };

  getOrganization = () => {
    return this.state.organization;
  };

  // Session storage

  setStored = (key, data) => {
    this.updateStored(
      merge({}, this.state.stored, {
        [key]: data,
      })
    );
    trackSession('add', key, data);
  };

  removeStored = (key) => {
    this.updateStored(omit(this.state.stored, key));
    trackSession('remove', key);
  };

  clearStored = () => {
    this.updateStored({});
  };

  popStored = (key) => {
    const stored = this.state.stored[key];
    if (stored) {
      this.removeStored(key);
      return stored;
    }
  };

  loadStored = () => {
    let data;
    try {
      const str = localStorage.getItem('session');
      if (str) {
        data = JSON.parse(str);
      }
    } catch (err) {
      localStorage.removeItem('session');
    }
    return data || {};
  };

  updateStored = (data) => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('session', JSON.stringify(data));
    } else {
      localStorage.removeItem('session');
    }
    this.setState({
      stored: data,
    });
  };

  // History

  attachHistory = () => {
    this.props.history.listen(this.onHistoryChange);
  };

  onHistoryChange = () => {
    this.setState({
      error: null,
    });
  };

  render() {
    return (
      <SessionContext.Provider
        value={{
          ...this.state,
          load: this.load,
          setToken: this.setToken,
          setStored: this.setStored,
          removeStored: this.removeStored,
          clearStored: this.clearStored,
          updateUser: this.updateUser,
          clearUser: this.clearUser,
          reloadUser: this.reloadUser,
          authenticate: this.authenticate,
          logout: this.logout,
          hasRoles: this.hasRoles,
          hasRole: this.hasRole,
          isAdmin: this.isAdmin,
          setOrganization: this.setOrganization,
          getOrganization: this.getOrganization,
        }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

const WrappedSessionProvider = withRouter(SessionProvider);
export { WrappedSessionProvider as SessionProvider };

export function useSession() {
  return useContext(SessionContext);
}

export const withSession = wrapContext(SessionContext);

export function withLoadedSession(Component) {
  Component = withSession(Component);
  return (props) => {
    const { loading } = useSession();
    if (loading) {
      return null;
    }
    return <Component {...props} />;
  };
}