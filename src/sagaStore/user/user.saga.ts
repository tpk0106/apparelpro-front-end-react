import {
  all,
  call,
  type CallEffect,
  put,
  type PutEffect,
  takeLatest,
} from "redux-saga/effects";
import { type AnyAction } from "redux-saga";
import { type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import {
  login,
  register,
  logOut,
  getUserByEmailAddress,
  updateEditUser,
} from "../../services/userService";
import { type LoginRequest } from "../../interfaces/login/loginRequest";
import {
  signUpFailed,
  signUpSuccess,
  signInFailed,
  signInSuccess,
  signOutSuccess,
  signOutFailed,
  getUserByEmailSuccess,
  getUserByEmailFailed,
  updateUserSuccess,
  updateUserFailure,
} from "./user.action";
import { USER_ACTION_TYPES } from "./user.types";
import type { LoginResponse } from "../../interfaces/login/loginResponse";
import type { User } from "../../interfaces/register/User";
import { handleApiError } from "../../utils/errorHandler";
import { USER_CREDENTIALS } from "../../interfaces/definitions";

export function* signUpUser(
  action: PayloadAction<User>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    // 1. Call your axios service
    (yield call(register, payload)) as User;

    // 2. Dispatch success action
    yield put(signUpSuccess(true));
    // 2. Display a success toast alert
    toast.success("Registration successful! Redirecting...", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error) {
    // 4. Trigger the react-toastify error pop-up
    handleApiError(error);

    // 5. Alert the Redux store about the failure
    yield put(signUpFailed(error));
  }
}

export function* updateUser(
  action: PayloadAction<User>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditUser, payload.email, payload);

    yield put(updateUserSuccess(true));
  } catch (error) {
    yield put(updateUserFailure(error));
  }
}

// const tokenKey: string = "token";
// const refreshTokenKey: string = "refreshToken";
// const userKey: string = "user";

export function* signInUser(
  action: PayloadAction<LoginRequest>,
): Generator<CallEffect | PutEffect<AnyAction>, void, LoginResponse> {
  try {
    const { payload } = action;
    const user: LoginResponse = (yield call(login, payload)) as LoginResponse;
    const { token, refreshToken, knownAs, email } = user.data;

    console.log("user data", user.data);
    console.log("user cred", USER_CREDENTIALS.USER_KEY);

    localStorage.setItem(USER_CREDENTIALS.TOKEN_KEY, token);
    localStorage.setItem(USER_CREDENTIALS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(USER_CREDENTIALS.USER_KEY, knownAs);
    localStorage.setItem(USER_CREDENTIALS.USER_ID, email);
    // localStorage.setItem(USER_CREDENTIALS.USER_KEY, knownAs);

    yield put(signInSuccess(user.data.email));
    // 2. Display a success toast alert
    toast.success("login successful! Redirecting...", {
      position: "top-right",
      autoClose: 3000,
    });
  } catch (error: unknown) {
    // 4. Trigger the react-toastify error pop-up
    handleApiError(error);
    yield put(signInFailed(error));
  }
}

export function* signOutUser(): Generator<
  CallEffect<boolean> | PutEffect<AnyAction>,
  void,
  unknown
> {
  try {
    yield call(logOut);
    yield put(signOutSuccess());
    toast.success("logout successfully !", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error: unknown) {
    yield put(signOutFailed(error));
  }
}

export function* getUserByEmail(
  action: PayloadAction<string>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    // 1. Call your axios service
    console.log("payload in sagas :", payload);
    const user = (yield call(getUserByEmailAddress, payload)) as User;

    // 2. Dispatch success action
    yield put(getUserByEmailSuccess(user));
    // 2. Display a success toast alert
    // toast.success("Registration successful! Redirecting...", {
    //   position: "top-right",
    //   autoClose: 3000,
    // });
  } catch (error) {
    // 4. Trigger the react-toastify error pop-up
    handleApiError(error);

    // 5. Alert the Redux store about the failure
    yield put(getUserByEmailFailed(error));
  }
}

export function* onSignUpStart() {
  yield takeLatest(USER_ACTION_TYPES.USER_REGISTER_START, signUpUser);
}

export function* onUpdateUserStart() {
  yield takeLatest(USER_ACTION_TYPES.UPDATE_USER_START, updateUser);
}

export function* onSignInStart() {
  yield takeLatest(USER_ACTION_TYPES.USER_SIGNIN_START, signInUser);
}

export function* onSignOutStart() {
  yield takeLatest(USER_ACTION_TYPES.USER_SIGNOUT_START, signOutUser);
}

export function* onGetUserByEmailStart() {
  yield takeLatest(USER_ACTION_TYPES.GET_USER_BY_EMAIL_START, getUserByEmail);
}

// https://stackoverflow.com/questions/53071610/yield-all-in-saga-is-not-waiting-for-all-the-effects-to-complete

export function* userSagas() {
  yield all([
    call(onSignUpStart),
    call(onSignInStart),
    call(onSignOutStart),
    call(onGetUserByEmailStart),
    call(onUpdateUserStart),
  ]);
}

// function* call(login: (credentials: LoginRequest) => Promise<any>, loginRequest: LoginRequest): LoginRequest {
//   throw new Error("Function not implemented.");
// }
