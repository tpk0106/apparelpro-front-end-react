// export const INITIAL_STATE = {
//   currentUser: null,
//   success: false,
//   isLoading: false,
//   error: null,
// };

import type { RootState } from "../rootReducer";

// import type { User } from "../../interfaces/register/User";

// user.selector.ts

// Explicitly type the incoming global state tree
export const getCurrentUser = (state: RootState) => state.user.currentUser;

export const getCurrentUserDetails = (state: RootState) => state.user.user;

export const getRegisterSuccess = (state: RootState) =>
  state.user.registerSuccess;

export const getIsLoading = (state: RootState) => state.user.isLoading;

// // Returns the email string stored at login (e.g. "manager@apparelpro.com")
// export const getCurrentUser = (state: RootState): string | null =>
//   state?.user?.currentUser;

// // Returns the complex profile data container loaded from the backend
// export const getCurrentUserDetails = (state: RootState): any => state?.user?.user;

// export const getCurrentUser = (profile: {
//   user: { currentUser: string };
// }): string => profile?.user.currentUser;

// export const getCurrentError = (profile: { user: { error: string } }): string =>
//   profile?.user.error;

// Use any or a custom User type depending on what your login payload parses into Redux
// export const getCurrentUser = (state: any): any => {
//   // DEVELOPMENT DIAGNOSTIC: Check your browser inspect panel for this log!
//   console.log("Full Redux State Tree:", state);

//   return state?.user?.currentUser;
// };

// export const getCurrentUserEmail = (state: any): string => {
//   // DEVELOPMENT DIAGNOSTIC: Check your browser inspect panel for this log!
//   // console.log("Full Redux State Tree:", state);

//   return state?.user?.email;
// };

// export const getCurrentUserDetails = (state: any): User => {
//   // DEVELOPMENT DIAGNOSTIC: Check your browser inspect panel for this log!
//   console.log("Full Redux State Tree:", state.user.user);

//   return state?.user.user;
// };

// export const getCurrentError = (state: any): any => state?.user?.error;
