import { Canvas } from './canvas';
import { Transform } from './types';
import { drawLines, drawText } from './utils';
import { Gym } from '@/types/gym';

export interface Dot {
  x: number;
  y: number;
  isDragging: boolean;
  complete: boolean;
  radius: number;
  draggable: boolean;
  color: string;
  id: string;
}

export default function MapDots({
  gym,
  dots,
  selected_id,
  updateDots,
  setSelected,
  editMode = false,
}: {
  gym: Gym;
  selected_id: string | null;
  dots: Dot[];
  updateDots: (dots: Dot[]) => void;
  setSelected: (id: string) => void;
  editMode: boolean;
}) {
  // map state

  function drawAfter(
    ctx: CanvasRenderingContext2D,
    transformRef: React.RefObject<Transform>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    drawLines(gym.layout, ctx);

    if (editMode) {
      gym.layout.areas.forEach((area) => {
        drawText(area, ctx);
      });
    }

    dots.forEach((dot) => {
      if (dot.id === selected_id) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = dot.complete ? dot.color + '5e' : dot.color + '5e';
        ctx.fill();
        ctx.closePath();
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
      ctx.fillStyle = dot.complete ? dot.color : dot.color + '5e';
      ctx.fill();
      ctx.closePath();
    });
  }

  function preDrag(click: { x: number; y: number }) {
    return !dotClicked(click.x, click.y);
  }

  function onClick(click: { x: number; y: number }) {
    const clickedDot = dots.filter((dot) => {
      return Math.hypot(dot.x - click.x, dot.y - click.y) < dot.radius + 1;
    });

    if (clickedDot.length > 0) {
      setSelected(clickedDot[0].id);
    }
  }

  function dotClicked(x: number, y: number) {
    return dots.some((dot) => {
      if (dot.draggable && Math.hypot(dot.x - x, dot.y - y) < dot.radius + 1) {
        updateDots(
          dots.map((d) =>
            d.x === dot.x && d.y === dot.y ? { ...d, isDragging: true } : d,
          ),
        );
        return true;
      }
      return false;
    });
  }

  function onMove(click: { x: number; y: number }) {
    updateDots(
      dots.map((dot) =>
        dot.isDragging ? { ...dot, x: click.x, y: click.y } : dot,
      ),
    );
  }

  function onUp() {
    updateDots(
      dots.map((dot) => ({
        ...dot,
        isDragging: false,
      })),
    );
  }

  return (
    <div className="relative">
      <Canvas
        drawAfter={drawAfter}
        preDrag={preDrag}
        onClick={onClick}
        onMove={onMove}
        onUp={onUp}
        defaultTransform={{
          scale: 1.4,
          translateX: 0,
          translateY: 30,
        }}
        updates={[dots, gym]}
      />
    </div>
  );
}
