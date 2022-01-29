import React from 'react';
import { Modal, Table, Menu } from 'semantic';
import modal from 'helpers/modal';

import RequestBlock from 'screens/Docs/RequestBlock';
import { API_URL } from 'utils/env';
import CodeBlock from 'screens/Docs/CodeBlock';

@modal
export default class ShowRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'details',
    };
  }

  render() {
    const { ip, ...rest } = this.props.request;
    return (
      <>
        <Modal.Header>
          {rest.method} {rest.path}
        </Modal.Header>

        <Modal.Content scrolling>
          <Menu pointing secondary>
            <Menu.Item
              content="Request Details"
              active={this.state.tab === 'details'}
              onClick={() => this.setState({ tab: 'details' })}
            />
            <Menu.Item
              content="Example (cURL)"
              active={this.state.tab === 'curl'}
              onClick={() => this.setState({ tab: 'curl' })}
            />
          </Menu>
          {this.state.tab === 'details' && (
            <>
              <Table definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width={4}>Method</Table.Cell>
                    <Table.Cell>
                      <code>{rest.method}</code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell width={4}>URL</Table.Cell>
                    <Table.Cell>
                      <code>
                        {API_URL}
                        {rest.path}
                      </code>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
              {rest.body && (
                <>
                  <h3>Body</h3>
                  <CodeBlock
                    value={JSON.stringify(rest.body, null, 2)}
                    language="json"
                  />
                </>
              )}
              <h3>Headers</h3>
              <Table definition>
                <Table.Body>
                  {Object.keys(rest.headers).map((key) => (
                    <Table.Row key={key}>
                      <Table.Cell width={4}>{key}</Table.Cell>
                      <Table.Cell>
                        <code style={{ wordBreak: 'break-all' }}>
                          {rest.headers[key]}
                        </code>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          )}
          {this.state.tab === 'curl' && (
            <RequestBlock header={false} request={rest} />
          )}
        </Modal.Content>
      </>
    );
  }
}
