export interface Gym {
  id: string;
  name: string;
  location: string;
  about: string;
  layout: Layout;
}

export interface Layout {
  lines: Line[];
  areas: Area[];
}

export interface Area {
  joined: boolean;
  points: { x: number; y: number; isDragging: boolean }[];
  style: 'wall' | 'mat';
  name: string; // Optional color property for future use
  color: string;
}

export interface Line {
  joined: boolean;
  points: { x: number; y: number; isDragging: boolean }[];
  style: 'wall' | 'mat';
}
