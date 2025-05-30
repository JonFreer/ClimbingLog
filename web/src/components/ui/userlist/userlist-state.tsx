import { create } from 'zustand';
import { User, UserNamePair } from '@/types/routes';

type userListState = {
  userList: User[] | UserNamePair[];
  openUserList: (route: User[] | UserNamePair[]) => void;
  closeUserList: () => void;
};

export const useUserListState = create<userListState>((set) => ({
  userList: [],

  closeUserList: () => {
    set({ userList: [] });
  },

  openUserList: (userList: User[] | UserNamePair[]) => {
    set({ userList: userList });
  },
}));
