export const isBrowser = () => typeof window !== "undefined";

////////////////////////////////////
//user data global
//status: null, online.
export let userdataG = {
  userName: '',
  profilePicUrl: '',
  userType: null,
  logginIn: false,
  logged: false,
  localItem: '_NoneOfYourBusiness',
  token: null,
};
//testing to update just the selected field. keeping old data
export function updateDataUser(name,value){
  return {...userdataG, [name]: value}
}
////////////////////////////////////
//END user data global
