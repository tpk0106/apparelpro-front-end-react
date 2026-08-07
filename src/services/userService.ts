import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { User } from "../interfaces/register/User";
import type { LoginRequest } from "../interfaces/login/loginRequest";
import type { UserWithGroups } from "../interfaces/register/UserWithGroups";
import { USER_CREDENTIALS } from "../interfaces/definitions";
const NOTHING = "";

const register = async (newUser: User) => {
  const response = await client.post(
    APPARELPRO_ENDPOINTS.REGISTRATION.USER.POST,
    {
      ...newUser,
    },
  );
  return response.data;
};

const updateEditUser = async (email: string, existingUser: User) => {
  console.log("EMAIL :", email);
  console.log("USER TO EDIT :", existingUser);

  return await client.put(
    APPARELPRO_ENDPOINTS.REGISTRATION.USER.PUT,
    existingUser,
    {
      params: {
        email: email,
      },
    },
  );
};

const login = async (credentials: LoginRequest) => {
  return await client.post(APPARELPRO_ENDPOINTS.REGISTRATION.USER.LOGIN, {
    ...credentials,
  });
};

const logOut = async () => {
  localStorage.setItem(USER_CREDENTIALS.TOKEN_KEY, NOTHING);
  localStorage.setItem(USER_CREDENTIALS.REFRESH_TOKEN, NOTHING);
  localStorage.setItem(USER_CREDENTIALS.USER_KEY, NOTHING);
  const success = true;
  return success;
};

const getUserByEmailAddress = async (userEmail: string) => {
  const response = await client.get<string>(
    APPARELPRO_ENDPOINTS.REGISTRATION.USER.GET_BY_EMAIL + `${userEmail}`,

    // { params: { email: userEmail } },
  );
  return response.data;
};

// Users & Groups admin screen (2026-08-06) - these read/write AspNetUsers +
// AspNetUserRoles directly via the backend's new Identity-backed endpoints,
// separate from the legacy getUserByEmailAddress/updateEditUser above which
// still operate on the disconnected legacy Users table.
const getUsersWithGroups = async () => {
  return await client.get<UserWithGroups[]>(
    APPARELPRO_ENDPOINTS.REGISTRATION.USER.LIST_WITH_GROUPS,
  );
};

const assignUserToGroup = async (userId: string, groupId: string) => {
  return await client.post(
    `${APPARELPRO_ENDPOINTS.REGISTRATION.USER.USER_GROUP_BASE}${userId}/groups/${groupId}`,
  );
};

const removeUserFromGroup = async (userId: string, groupId: string) => {
  return await client.delete(
    `${APPARELPRO_ENDPOINTS.REGISTRATION.USER.USER_GROUP_BASE}${userId}/groups/${groupId}`,
  );
};

export {
  register,
  login,
  logOut,
  getUserByEmailAddress,
  updateEditUser,
  getUsersWithGroups,
  assignUserToGroup,
  removeUserFromGroup,
};
