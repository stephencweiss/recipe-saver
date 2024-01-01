export interface UpdatableUserError {
  type: 'UpdatableUserError'
  errors: {
    global: string | null;
    username: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  status: number
}

export interface UpdatablePasswordError {
  type: 'UpdatablePasswordError'
  errors: {
    global: string | null;
    password: string | null;
    confirmPassword: string | null;
  };
  status: number
}
