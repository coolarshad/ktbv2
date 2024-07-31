import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; // import your root reducer

const store = configureStore({
  reducer: rootReducer,
});

export default store;
