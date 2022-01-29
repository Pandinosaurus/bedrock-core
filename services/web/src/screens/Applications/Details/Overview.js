import React from 'react';
import { Table, Divider, Header } from 'semantic';
import screen from 'helpers/screen';
import Menu from './Menu';

import { formatDateTime } from 'utils/date';

@screen
export default class ApplicationOverview extends React.Component {
  render() {
    const { application } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        <Divider hidden />
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Description</Table.Cell>
              <Table.Cell>{application.description || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(application.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(application.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}