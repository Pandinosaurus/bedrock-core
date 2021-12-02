import React from 'react';
import PropTypes from 'prop-types';
import { Message, Button } from 'semantic/index.js';
import { withSession } from 'stores/index.js';
import screen from 'helpers/screen.jsx';
import { ENV_NAME } from 'utils/env.js';
import PageCenter from 'components/PageCenter.jsx';

class ErrorScreen extends React.Component {
  static layout = 'none';

  onLogoutClick = () => {
    this.context.logout(true);
  };

  onReloadClick = () => {
    window.location.reload();
  };

  render() {
    const { title } = this.props;
    return (
      <PageCenter maxWidth="400px">
        <div>
          <Message error header={title} content={this.renderErrorBody()} />
          <div>
            <Button size="small" onClick={this.onLogoutClick} primary>
              Logout
            </Button>
          </div>
        </div>
      </PageCenter>
    );
  }

  renderErrorBody() {
    const { error } = this.props;
    if (ENV_NAME === 'production') {
      if (error.status >= 500) {
        return (
          <p>
            Our site seems to be having issues. Please wait a bit and{' '}
            {this.renderReloadLink('reload')} the page.
          </p>
        );
      } else {
        return (
          <p>We're looking into the issue. {this.renderReloadLink('reload')}</p>
        );
      }
    } else {
      return error.message;
    }
  }

  renderReloadLink(text) {
    return (
      <span className="link" onClick={this.onReloadClick}>
        {text}
      </span>
    );
  }
}

ErrorScreen.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.object.isRequired,
};

ErrorScreen.defaultProps = {
  title: 'Something went wrong',
};

export default screen(withSession(ErrorScreen));
