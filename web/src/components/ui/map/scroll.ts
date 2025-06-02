import { Transform } from './types';

export const zoomOnWheel = (
  e: React.WheelEvent<HTMLCanvasElement>,
  drawCanvas = () => {},
  transform: React.RefObject<Transform>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  e.preventDefault();
  e.stopPropagation();
  if (!canvasRef.current) {
    return;
  }

  const scaleAmount = e.deltaY < 0 ? 1.05 : 0.95;
  const newScale = transform.current.scale * scaleAmount;

  const prev = transform.current;
  // Adjust translation to keep zoom centered on the mouse position
  const rect = canvasRef.current.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const newTranslateX =
    mouseX - ((mouseX - prev.translateX) * newScale) / prev.scale;
  const newTranslateY =
    mouseY - ((mouseY - prev.translateY) * newScale) / prev.scale;
  transform.current = {
    scale: newScale,
    translateX: newTranslateX,
    translateY: newTranslateY,
  };
  drawCanvas();
  return false;
};
