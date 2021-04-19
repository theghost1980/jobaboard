import { configureStore } from '@reduxjs/toolkit';
// import counterReducer from '../features/counter/counterSlice';
import newmessagesReducer from '../features/notifications/notiSlice';
import profileReducer from '../features/userprofile/profileSlice';
import socketReducer from '../features/socket/socketSlice';

export default configureStore({
    //testing with the counterReducer, later we modify
  reducer: {
    // counter: counterReducer,
    newmessages: newmessagesReducer,
    profile: profileReducer,
    socket: socketReducer,
  },
});