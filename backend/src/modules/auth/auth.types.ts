export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: {
    id: number;
    name: string;
    email: string;
  };
}
