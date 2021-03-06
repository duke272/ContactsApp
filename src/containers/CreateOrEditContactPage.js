import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router'
import ContactActions from '../actions/contact-actions';
import SnackbarActions from '../actions/snackbar-actions';
import ContactForm from '../components/ContactForm';

class CreateOrEditContactPage extends Component {
  constructor(props) {
    super(props);
    this.onContactSave = this.onContactSave.bind(this);
  }
  componentDidMount() {
    const { actions, params } = this.props;
    actions.initializeCreateOrEditContact(params);
  }
  componentWillReceiveProps(nextProps) {
    const { actions, params } = this.props;
    if (params.id !== nextProps.params.id) {
      actions.initializeCreateOrEditContact(nextProps.params);
    }
  }
  componentWillUnmount() {
    const { actions, params } = this.props;
    actions.initializeCreateOrEditContact(params);
  }
  onContactSave() {
    const { actions, displayError } = this.props;
    actions.saveContact()
      .then(() => {
        browserHistory.push('/list');
      })
      .catch(err => displayError(err));
  }
  render() {
    const { contact, actions } = this.props;
    return (
      <ContactForm
        contact={contact}
        onContactAttributeChange={actions.onContactAttributeChange}
        onContactAttributeBlur={actions.onContactAttributeBlur}
        onSaveClick={this.onContactSave}
      />
    );
  }
}

CreateOrEditContactPage.propTypes = {
  contact: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  params: PropTypes.object,
  displayError: PropTypes.func.isRequired,
};

const mapStateToProps = (store) => ({
  contact: store.contact,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ContactActions, dispatch),
  displayError: bindActionCreators(SnackbarActions, dispatch).displayError,
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrEditContactPage);
