export interface Route {
  id: string;
  grade: string;
  location: string;
  set_id: string;
  style: string;
  name: string;
  x: number;
  y: number;
  climb_count: number;
  color: string;
  user_sends: number;
  user_attempts: number;
  gym_id: string;
}

export interface Circuit {
  id: string;
  name: string;
  open: boolean;
  color: string;
  gym_id: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  about: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  profile_visible: boolean;
  send_visible: boolean;
  route_setter: boolean;
  has_profile_photo: boolean;
  has_cover_photo: boolean;
  home_gym: string | null;
}

export interface Climb {
  id: string;
  sent: boolean;
  time: string;
  route: string;
  user: string;
}

export interface UserList {
  users: { id: string; username: string; has_profile_photo: boolean }[];
  num_users: number;
}

export interface Video {
  id: string;
  user: string;
  time: string;
  route: string;
  processed: boolean;
  username: string;
  has_profile_photo: boolean;
}

export type Projects = string[];

export interface Set {
  id: string;
  name: string;
  date: string;
  circuit_id: string;
}

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export interface UserNamePair {
  id: string;
  username: string;
  has_profile_photo: boolean;
}

export interface ClimbSlim {
  route: Route;
  time: string;
}

export interface Activity {
  id: string;
  user: string;
  time: string;
  gym_id: string;
  climbs: ClimbSlim[];
  username: string;
  has_profile_photo: boolean;
  reactions: UserNamePair[];
}

export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};
