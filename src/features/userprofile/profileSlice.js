import { createSlice } from '@reduxjs/toolkit';

// TODO fix all of this to use it from navbar in the whole project so we may read one time only from ls
// and substitute the check() used in each page & component maybe...let us see how it goes.

export const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    logged: false,
    username: "",
    profilePicUrl: "",
    usertype: "",
    logginIn: false,
    token: "",
    loginmethod: "",
    access_token: "",
    bt: "",
    brt: "",
    banned: false,
    ts: "",
    msg: '',
    currentchatid: "",
    newmessages: "", 
    authbee: false,
  },
  reducers: { 
    setProfile: (state, action) => {
      state = action.payload;
      console.log('Whole profile was set!');
    },
    setValueOnProfile: (state, action) => { 
        console.log('Value on profile to set!',action.payload);
        return {...state, [action.payload.type]: action.payload.value};
    }, 
  },
});

export const { setProfile, setValueOnProfile } = profileSlice.actions;

export const selectProfile = state => state.profile;

export default profileSlice.reducer;