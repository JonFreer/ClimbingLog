import { configureAuth } from 'react-query-auth';
import { AuthResponse, User } from '../types/routes';
import { api } from './api-client';
import { z } from 'zod';
import { queryClient } from '../main';
// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

const getUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response;
};

const logout = (): Promise<void> => {
  localStorage.removeItem('token');
  queryClient.resetQueries({ queryKey: ['climbs'], exact: true });
  queryClient.refetchQueries({ queryKey: ['climbs'], exact: true });

  return new Promise((resolve) => {
    resolve();
  });
};

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = (data: LoginInput): Promise<AuthResponse> => {
  return api.post('/auth/jwt/login', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (data: RegisterInput): Promise<User> => {
  return api.post('/auth/register', data);
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const login_response = await loginWithEmailAndPassword(data);
    localStorage.setItem('token', login_response.access_token);
    // await queryClient.invalidateQueries({
    //   queryKey: ["authenticated-user"],
    // });
    const response = await getUser();
    return response;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data); // eslint-disable-line @typescript-eslint/no-unused-vars
    return null;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);
