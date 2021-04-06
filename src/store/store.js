import { configureStore } from '@reduxjs/toolkit';
// import counterReducer from '../features/counter/counterSlice';
import newmessagesReducer from '../features/notifications/notiSlice';
import profileReducer from '../features/userprofile/profileSlice';

export default configureStore({
    //testing with the counterReducer, later we modify
  reducer: {
    // counter: counterReducer,
    newmessages: newmessagesReducer,
    profile: profileReducer,
  },
});