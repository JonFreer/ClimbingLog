export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface Line {
  joined: boolean;
  points: { x: number; y: number; isDragging: boolean }[];
  style: 'wall' | 'mat';
}
