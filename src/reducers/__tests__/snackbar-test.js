import snackbar from '../snackbar-reducer';
import { initialState } from '../snackbar-reducer';
import { CLOSE_ERROR_MESSAGE, SET_ERROR_MESSAGE } from '../../constants/snackbar-actions-constants';

it('returns the same state on an unhandled action', () => {
  expect(snackbar(initialState, { type: '_NULL' })).toMatchSnapshot();
});

it('handles close snackbar action', () => {
  expect(snackbar(initialState, { type: CLOSE_ERROR_MESSAGE })).toMatchSnapshot();
});

it('handles display error action', () => {
  const customError = 'Custom error';
  expect(snackbar(initialState, { type: SET_ERROR_MESSAGE, message: customError }))
    .toMatchSnapshot();
});
