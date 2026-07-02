import { USER_ACTION_TYPES } from "./user.types";

// Check if a session already exists in localStorage on browser reload
const getInitialUser = () => {
  try {
    const savedUser = localStorage.getItem("user"); // Use your key name or USER_CREDENTIALS.USER_KEY
    return savedUser ? savedUser : null;
  } catch {
    return null;
  }
};

const INITIAL_STATE = {
  currentUser: getInitialUser(),
  success: false,
  registerSuccess: false,
  isLoading: false,
  error: null,
  currentUserEmail: null,
  user: null,
};

export const userReducer = (state = INITIAL_STATE, action: any) => {
  const { type, payload } = action;

  switch (type) {
    case USER_ACTION_TYPES.USER_REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null, // Clear old login errors
        success: false, // Reset old success flags
        registerSuccess: false, // Reset register flag when a new sign-up starts
        currentUserEmail: null,
      };

    case USER_ACTION_TYPES.USER_REGISTER_SUCCESS:
      return {
        ...state,
        success: true,
        isLoading: false,
        registerSuccess: true, // 👈 Set this flag true on successful sign-up
        currentUserEmail: null,
      };

    case USER_ACTION_TYPES.USER_SIGNIN_START:
      return {
        ...state,
        error: null, // Clear old registration errors
        isLoading: true,
        success: false,
        currentUserEmail: null,
      };
    case USER_ACTION_TYPES.USER_SIGNIN_SUCCESS:
      console.log("payload in success: ", payload);
      return {
        ...state,
        currentUser: payload, // Stores the flat email string cleanly (e.g. "admin@apparelpro.com")
        error: null,
        success: true,
        isLoading: false,
      };
    case USER_ACTION_TYPES.USER_SIGNOUT_START:
      return { ...state, isLoading: true, success: false };

    case USER_ACTION_TYPES.USER_SIGNOUT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        currentUser: null,
        user: null, // Safely wipes User A's profile details cache on logout!
      };
    case USER_ACTION_TYPES.RESET_SIGNUP_STATE:
      return {
        ...state,
        registerSuccess: false,
        error: null,
        isLoading: false,
        // 🚀 FIXED: Do NOT alter state.user or state.currentUser here anymore!
      };
    case USER_ACTION_TYPES.RESET_SIGNIN_STATE:
      return {
        ...state,
        success: false,
        error: null,
        isLoading: false,
        // 🚀 FIXED: Leave state.user untouched here as well
      };

    case USER_ACTION_TYPES.GET_USER_BY_EMAIL_START:
      return {
        ...state,
        error: null,
        isLoading: true,
        success: false,
      };
    case USER_ACTION_TYPES.GET_USER_BY_EMAIL_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        user: payload,
      };

    // https://react.dev/learn/extracting-state-logic-into-a-reducer
    case USER_ACTION_TYPES.USER_SIGNIN_FAILURE:
    case USER_ACTION_TYPES.USER_SIGNOUT_FAILURE:
    case USER_ACTION_TYPES.USER_REGISTER_FAILURE:
    case USER_ACTION_TYPES.GET_USER_BY_EMAIL_FAILURE:
      return {
        ...state,
        error: payload.response?.data,
        isLoading: false,
        success: false,
        user: null,
      };

    case USER_ACTION_TYPES.UPDATE_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case USER_ACTION_TYPES.UPDATE_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case USER_ACTION_TYPES.UPDATE_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };

    default:
      return state;
  }
};
