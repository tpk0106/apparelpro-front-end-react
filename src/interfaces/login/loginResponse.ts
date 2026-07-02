export interface LoginResponse {
  data: loggedInUser;
}

type loggedInUser = {
  email: string;
  token: string;
  refreshToken: string;
  knownAs: string;
  photo: BinaryType;
  success: boolean;
};
