import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { User } from "../interfaces/register/User";
import type { LoginRequest } from "../interfaces/login/loginRequest";
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

export { register, login, logOut, getUserByEmailAddress, updateEditUser };
