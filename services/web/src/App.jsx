import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch } from 'react-router-dom';
import { AuthSwitch } from 'helpers/routes/index.js';
import { useSession } from 'stores/index.js';

import Dashboard from 'screens/Dashboard/index.jsx';
import Login from 'screens/Auth/Login/index.jsx';

const App = () => {
  return (
    <Switch>
      <AuthSwitch path="/" loggedIn={Dashboard} loggedOut={Login} exact />
    </Switch>
  );
};

export default hot(App);
