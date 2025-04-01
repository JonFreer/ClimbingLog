export interface Route {
  id: string;
  grade: string;
  location: string;
  set_id: string;
  style: string;
  name: string;
  x: number;
  y: number;
}

export interface Circuit {
  id: string;
  name: string;
  open: boolean;
  color: string;
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
}

export interface Climb {
  id: string;
  sent: boolean;
  time: string;
  route: string;
  user: string;
}

export interface SentBy {
  users: { id: string; username: string; has_profile_photo: boolean }[];
  num_users: number;
}

export type Projects = string[];

export interface Set {
  id: string;
  name: string;
  date: string;
  circuit_id: string;
}
