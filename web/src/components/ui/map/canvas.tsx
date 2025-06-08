import { TouchEvent, useEffect, useRef, useState } from 'react';
import { Transform } from './types';
import { getCoordinates, getPinchDistance, getTouchCenter } from './utils';
import { zoomOnWheel } from './scroll';

//drawAfter is a function that will be called after the canvas is drawn

export const Canvas: React.FC<{
  drawAfter: (
    ctx: CanvasRenderingContext2D,
    transformRef: React.RefObject<Transform>,
  ) => void;
  preDrag?: (click: { x: number; y: number }) => boolean;
  onClick?: (click: { x: number; y: number }) => void;
  onMove?: (click: { x: number; y: number }) => void;
  onUp?: () => void;
  defaultTransform?: Transform;
  updates?: any[];
}> = ({
  drawAfter,
  preDrag,
  onClick,
  onMove,
  onUp,
  defaultTransform,
  updates, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef<Transform>(
    defaultTransform
      ? defaultTransform
      : {
          scale: 1,
          translateX: 0,
          translateY: 0,
        },
  );
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const firstMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

  //touch controls
  const initialPinchDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);
  const lastPinchCenterRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentDiv = canvas.parentElement;
    if (!parentDiv) return;
    const { width, height } = parentDiv.getBoundingClientRect();

    // Set initial translation to center (0, 0)
    transformRef.current = {
      ...transformRef.current,
      translateX: width / 2 + (defaultTransform?.translateX || 0),
      translateY: height / 2 + (defaultTransform?.translateY || 0),
    };

    draw();
  }, [canvasRef.current]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    if (!ctx || !canvasRef.current) {
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const { width, height } = ctx.canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    ctx.translate(
      transformRef.current.translateX * dpr,
      transformRef.current.translateY * dpr,
    );

    ctx.scale(
      transformRef.current.scale * dpr,
      transformRef.current.scale * dpr,
    );

    drawAfter(ctx, transformRef);
    ctx.restore();
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }); // Re-run on updates to ensure canvas resizes correctly

  function handleResize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentDiv = canvas.parentElement;
    if (!parentDiv) return;
    const { width, height } = parentDiv.getBoundingClientRect();
    const prevWidth = canvas.width;
    const prevHeight = canvas.height;

    const dpr = window.devicePixelRatio || 1;

    if (width !== prevWidth || height !== prevHeight) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Adjust translation to keep the center point in the same place
      transformRef.current = {
        ...transformRef.current,
        translateX:
          transformRef.current.translateX + (width - prevWidth / dpr) / 2,
        translateY:
          transformRef.current.translateY + (height - prevHeight / dpr) / 2,
      };

      draw();
    }
  }

  useEffect(() => {
    draw();
  }, [drawAfter]);

  function handleMouseUp() {
    onUp?.();
  }

  function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    event.preventDefault();
    startMove(event);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLCanvasElement>) {
    event.preventDefault();
    if (!canvasRef.current) {
      return;
    }
    if (event.touches.length === 2) {
      initialPinchDistanceRef.current = getPinchDistance(event.touches);
      initialScaleRef.current = transformRef.current.scale;
      lastPinchCenterRef.current = getTouchCenter(
        event.touches,
        canvasRef.current,
      );
    }
    startMove(event.touches[0]);
  }

  const handleTouchMove = (event: TouchEvent<HTMLCanvasElement>) => {
    // event.preventDefault();
    if (!canvasRef.current) {
      return;
    }
    if (event.touches.length === 2) {
      const newPinchDistance = getPinchDistance(event.touches);
      const scaleAmount = newPinchDistance / initialPinchDistanceRef.current;
      const newScale = initialScaleRef.current * scaleAmount;
      const center = getTouchCenter(event.touches, canvasRef.current);
      const dx = center.x - lastPinchCenterRef.current.x;
      const dy = center.y - lastPinchCenterRef.current.y;

      const newTranslateX =
        center.x -
        ((center.x - transformRef.current.translateX) * newScale) /
          transformRef.current.scale;
      const newTranslateY =
        center.y -
        ((center.y - transformRef.current.translateY) * newScale) /
          transformRef.current.scale;

      transformRef.current = {
        scale: newScale,
        translateX: newTranslateX + dx,
        translateY: newTranslateY + dy,
      };
      lastPinchCenterRef.current = center;
      draw();
    } else {
      move(event.touches[0]);
    }
  };

  function handleTouchEnd() {
    // no event parameter needed
    setIsDraggingCanvas(false);
    onUp?.();
  }

  //shared startMove function for touchStart and mousedown
  function startMove(event: React.MouseEvent<HTMLCanvasElement> | React.Touch) {
    if (!canvasRef.current) {
      return;
    }

    const click = getCoordinates(
      event,
      canvasRef.current,
      transformRef.current,
    );

    const can_drag = preDrag?.(click); // ?? true;
    if (can_drag) {
      setIsDraggingCanvas(true);
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      firstMousePosRef.current = { x: event.clientX, y: event.clientY };
    }
  }

  //shared move function for mouseMove and touchMove
  function move(event: React.MouseEvent<HTMLCanvasElement> | React.Touch) {
    if (!canvasRef.current) {
      return;
    }
    if (isDraggingCanvas) {
      const dx = event.clientX - lastMousePosRef.current.x;
      const dy = event.clientY - lastMousePosRef.current.y;
      transformRef.current = {
        ...transformRef.current,
        translateX: transformRef.current.translateX + dx,
        translateY: transformRef.current.translateY + dy,
      };
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      draw();
    } else {
      const click = getCoordinates(
        event,
        canvasRef.current,
        transformRef.current,
      );
      onMove?.(click);
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    move(event);
  };

  function handleMouseLeave() {
    setIsDraggingCanvas(false);
  }

  function handleOnClick(event: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) {
      return;
    }

    setIsDraggingCanvas(false);

    if (
      isDraggingCanvas &&
      lastMousePosRef.current.x != firstMousePosRef.current.x &&
      lastMousePosRef.current.y != firstMousePosRef.current.y
    ) {
      return;
    }

    const click = getCoordinates(
      event,
      canvasRef.current,
      transformRef.current,
    );
    // Handle click logic here if needed

    onClick?.(click);
  }

  return (
    <div className="max-h-96 touch-none relative">
      <canvas
        className="w-full"
        ref={canvasRef}
        width={800}
        height={1200}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        // Touch events
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={(event) => {
          zoomOnWheel(event, draw, transformRef, canvasRef);
        }}
        onMouseLeave={handleMouseLeave}
        onClick={handleOnClick}
      ></canvas>
    </div>
  );
};
