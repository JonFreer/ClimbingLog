import { create } from 'zustand';
import { Route, User } from '../../../types/routes';

type userListState = {
  userList: User[];
  openUserList: (route: User[]) => void;
  closeUserList: () => void;
};

export const useUserListState = create<userListState>((set) => ({
  userList: [],

  closeUserList: () => {
    set({ userList: [] });
  },

  openUserList: (userList: User[]) => {
    set({ userList: userList });
  },
}));
