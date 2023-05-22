import React from 'react';
import { Button, Form, Modal, Icon } from 'semantic';

import AutoFocus from 'components/AutoFocus';
import modal from 'helpers/modal';

import ErrorMessage from 'components/ErrorMessage';
import { HelpTip } from 'components';

import { DocsContext } from '../utils/context';

@modal
export default class EditFieldModal extends React.Component {
  static contextType = DocsContext;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      value: props.value,
    };
  }

  setField = (evt, { value }) => {
    this.setState({
      value,
    });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
    });
    try {
      const { name } = this.props;
      const { value } = this.state;
      const path = [...this.props.path, name];
      await this.context.updatePath(path, value);
      this.setState({
        loading: false,
      });
      this.props.close();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onKeyDown = (evt) => {
    const { key, metaKey } = evt;
    if (key === 'Enter' && metaKey) {
      this.onSubmit();
    }
  };

  render() {
    const { label, markdown } = this.props;
    const { value, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          Edit {label}
          {markdown && (
            <HelpTip
              icon={
                <Icon
                  size="large"
                  name="brands markdown"
                  style={{ color: '#666' }}
                  fitted
                />
              }
              text="Supports Markdown"
            />
          )}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form id="edit-docs-field" error={!!error} onSubmit={this.onSubmit}>
              <ErrorMessage error={error} />
              {markdown ? (
                <Form.TextArea
                  value={value || ''}
                  onChange={this.setField}
                  onKeyDown={this.onKeyDown}
                />
              ) : (
                <Form.Input
                  type="text"
                  value={value || ''}
                  onChange={this.setField}
                />
              )}
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            content="Save"
            form="edit-docs-field"
            loading={loading}
            disabled={loading}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
