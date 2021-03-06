import { LOADING_CONTACT, INITIALIZE_CONTACT, UPDATE_CONTACT_ATTRIBUTE,
VALIDATE_CONTACT, VALIDATE_CONTACT_ATTRIBUTE } from '../constants/contact-actions-constants';
import _ from 'lodash';

const requiredValidation =
  (value) => value !== undefined && value !== null && (!_.isEmpty(value) || _.isNumber(value));

const isEmail = (value) => {
  if (value) {
    const regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    return regExp.test(value);
  }
  return true;
};

const isUrl = (value) => {
  if (value) {
    const regExp = new RegExp("^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?");
    return regExp.test(value);
  }
  return true;
};

const applyValidator = (ruleObject, value) => {
  let error;
  let functionValidator;
  if (_.isFunction(ruleObject.rule)) {
    functionValidator = ruleObject.rule;
  }
  if (functionValidator && !functionValidator(value)) {
    error = ruleObject.error || `${ruleObject.rule} not followed`;
  } else if (!functionValidator) {
    console.warn('applyValidator: %s does not exists', ruleObject.rule);
  }
  return error;
};

const validateAll = (rulesObject, contact) => {
  const errors = {};

  _.each(rulesObject, (rules, name) => {
    if (rules && _.isArray(rules)) {
      const value = contact[name];
      _.each(rules, (ruleObject) => {
        const error = applyValidator(ruleObject, value);
        if (error) {
          errors[name] = error;
          return;
        }
      });
    } else {
      console.warn('validateAll: missing parameters rules ');
    }
  });

  return _.isEmpty(errors) ? false : errors;
};

const rulesObject = {
  name: [{ rule: requiredValidation, error: 'Name is required' }],
  email: [
    { rule: requiredValidation, error: 'Email is required' },
    { rule: isEmail, error: 'Email format is incorrect' },
  ],
  imgUrl: [{ rule: isUrl, error: 'Invalid url' }],
};

export const initialState = {
  loading: false,
  isModified: false,
  contact: {
    email: '',
    imgUrl: '',
    name: '',
    phoneNumber: '',
  },
  errors: {},
};

const contact = (state = initialState, action) => {
  const { name, value } = action;
  let error;
  let errors = state.errors;
  switch (action.type) {
    case (LOADING_CONTACT):
      return Object.assign({}, state, { loading: true });
    case (INITIALIZE_CONTACT):
      return Object.assign({}, state, { contact: action.contact || {
        imgUrl: '',
        name: '',
        phoneNumber: '',
        email: '',
      }, loading: false, errors: {} });
    case (UPDATE_CONTACT_ATTRIBUTE):
      return Object.assign({}, state, { isModified: true,
        contact: Object.assign({}, state.contact, { [name]: value }) });
    case VALIDATE_CONTACT_ATTRIBUTE:
      error = validateAll(_.pick(rulesObject, name), { [name]: value });
      if (error && error[name]) {
        errors = { ...errors, [name]: error[name] };
      } else {
        errors = _.omit(errors, name);
      }
      return Object.assign({}, state, { errors: Object.assign({}, errors) });
    case VALIDATE_CONTACT:
      errors = validateAll(rulesObject, state.contact);
      return Object.assign({}, state, { errors: Object.assign({}, errors) });
    default:
      return state;
  }
};

export default contact;
