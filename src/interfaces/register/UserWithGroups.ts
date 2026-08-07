export interface UserWithGroups {
  id: string;
  email: string;
  userName: string;
  knownAs: string | null;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  groups: string[];
}
