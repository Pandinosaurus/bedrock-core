import React from 'react';
import { Dimmer, Loader } from 'semantic/index.js';
import PageCenter from './PageCenter.jsx';

export default (props) => (
  <PageCenter>
    <Dimmer inverted active>
      <Loader {...props} inverted />
    </Dimmer>
  </PageCenter>
);
