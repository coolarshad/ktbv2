import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // define your initial state here
};

const yourSlice = createSlice({
  name: 'yourSlice',
  initialState,
  reducers: {
    // define your reducers here
    someAction: (state, action) => {
      // handle action
    },
  },
});

export const { someAction } = yourSlice.actions;

export default yourSlice.reducer;
