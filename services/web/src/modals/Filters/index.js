import React from 'react';
import { Modal, Form, Ref, Icon, Button, Label } from 'semantic-ui-react';
import DateTimeField from 'components/form-fields/DateTime';

import Input from './Input';
import Dropdown from './Dropdown';

export default class Filters extends React.Component {

  static Input = Input;
  static Dropdown = Dropdown;

  constructor(props) {
    super(props);
    this.state = {
      ...props.filters,
    };
    this.formRef = React.createRef();
  }

  onModalOpen = () => {
    setTimeout(() => {
      const input = this.formRef.current.querySelector('input[name]');
      input?.focus();
    });
  }

  onFilterChange = (evt, { name, value }) => {
    this.setFilter(name, value);
  }

  onSubmit = () => {
    this.props.onSave(this.state);
  };

  onReset = () => {
    const state = {};
    this.setState(state);
    this.props.onSave(state);
  };

  setFilter(name, value) {
    this.setState({
      [name]: value,
    });
  }

  hasFilters() {
    const { filters } = this.props;
    return filters && Object.keys(filters).length > 0;
  }

  render() {
    return (
      <Modal
        closeIcon
        size="tiny"
        onOpen={this.onModalOpen}
        trigger={
          this.hasFilters() ? (
            <Button as="div" labelPosition="right" style={{ margin: '0 10px' }}>
              <Button basic primary>
                <Icon name="filter" />
                Filter
              </Button>
              <Label as="a" basic color="blue" pointing="left">
                {Object.keys(this.props.filters).length}
              </Label>
            </Button>
          ) : (
            <Button basic primary style={{ margin: '0 10px' }}>
              <Icon name="filter" />
              Filter
            </Button>
          )
        }>
        <Modal.Header>Filter</Modal.Header>
        <Modal.Content>
          <Ref innerRef={this.formRef}>
            <Form
              id="filters"
              onSubmit={this.onSubmit}>
              {this.renderFilters()}
              {this.renderDateFilters()}
            </Form>
          </Ref>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Reset" onClick={this.onReset} />
          <Button primary form="filters" content="Apply" />
        </Modal.Actions>
      </Modal>
    );
  }

  renderDateFilters() {
    const { startAt, endAt } = this.state;
    return (
      <Form.Field>
        <label>Created At</label>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <DateTimeField
            name="startAt"
            value={startAt}
            placeholder="No Start"
            includeTime={false}
            onChange={(value) => this.setFilter('startAt', value)}
            clearable
          />
        </span>
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            margin: '0 10px',
            opacity: '.2',
          }}>
          &ndash;
        </span>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <DateTimeField
            name="endAt"
            value={endAt}
            placeholder="No End"
            includeTime={false}
            onChange={(value) => this.setFilter('endAt', value)}
            clearable
          />
        </span>
      </Form.Field>
    );
  }

  renderFilters() {
    return React.Children.map(this.props.children, (filter) => {
      const { name } = filter.props;
      return React.cloneElement(filter, {
        value: this.state[name] || '',
        onChange: this.onFilterChange,
      });
    });
  }
}