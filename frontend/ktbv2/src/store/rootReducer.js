import { combineReducers } from 'redux';
import yourSlice from './yourSlice'; // import your slice reducer

const rootReducer = combineReducers({
  yourSlice,
});

export default rootReducer;
