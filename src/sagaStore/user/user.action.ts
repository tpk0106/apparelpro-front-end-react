import type { User } from "../../interfaces/register/User";
import type { LoginRequest } from "../../interfaces/login/loginRequest";
// import type { LoginResponse } from "../../interfaces/login/loginResponse";
import { createAction } from "../../utils/reducer/reducer.utils";
import { USER_ACTION_TYPES } from "./user.types";

const signUpStart = (user: User) => {
  return createAction(USER_ACTION_TYPES.USER_REGISTER_START, user);
};

const signUpSuccess = (success: boolean) => {
  return createAction(USER_ACTION_TYPES.USER_REGISTER_SUCCESS, {
    success,
  });
};

const signUpFailed = (error: unknown) => {
  return createAction(USER_ACTION_TYPES.USER_REGISTER_FAILURE, error);
};

// update user

const updateUserStart = (userToEdit: User) => {
  return createAction(USER_ACTION_TYPES.UPDATE_USER_START, userToEdit);
};

const updateUserSuccess = (success: boolean) => {
  return createAction(USER_ACTION_TYPES.UPDATE_USER_SUCCESS, success);
};

const updateUserFailure = (error: unknown) => {
  return createAction(USER_ACTION_TYPES.UPDATE_USER_FAILURE, error);
};

// Add this new clean-up action trigger
const resetSignUpState = () => {
  return createAction(USER_ACTION_TYPES.RESET_SIGNUP_STATE, null);
};

const signInStart = (user: LoginRequest) => {
  return createAction(USER_ACTION_TYPES.USER_SIGNIN_START, user);
};

const signInSuccess = (loggedInUserName: string) => {
  return createAction(USER_ACTION_TYPES.USER_SIGNIN_SUCCESS, loggedInUserName);
};

const resetSignInState = () => {
  return createAction(USER_ACTION_TYPES.RESET_SIGNIN_STATE, null);
};

const signInFailed = (error: unknown) => {
  return createAction(USER_ACTION_TYPES.USER_SIGNIN_FAILURE, error);
};

const signOutStart = () => {
  return createAction(USER_ACTION_TYPES.USER_SIGNOUT_START, null);
};

const signOutSuccess = () => {
  return createAction(USER_ACTION_TYPES.USER_SIGNOUT_SUCCESS, null);
};

const signOutFailed = (error: unknown) => {
  return createAction(USER_ACTION_TYPES.USER_SIGNOUT_FAILURE, error);
};

const getUserByEmailStart = (userEmail: string) => {
  return createAction(USER_ACTION_TYPES.GET_USER_BY_EMAIL_START, userEmail);
};

const getUserByEmailSuccess = (user: User) => {
  return createAction(USER_ACTION_TYPES.GET_USER_BY_EMAIL_SUCCESS, user);
};

const getUserByEmailFailed = (error: unknown) => {
  return createAction(USER_ACTION_TYPES.GET_USER_BY_EMAIL_FAILURE, error);
};

export {
  signUpStart,
  signUpSuccess,
  signUpFailed,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  resetSignUpState,
  signInStart,
  signInSuccess,
  resetSignInState,
  signInFailed,
  signOutStart,
  signOutSuccess,
  signOutFailed,
  getUserByEmailStart,
  getUserByEmailSuccess,
  getUserByEmailFailed,
};
