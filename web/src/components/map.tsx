import React, { useRef, useState, useEffect } from 'react';

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

const DraggableDotsCanvas = (props: {
  dots: Dot[];
  selected_id: string | null;
  updateDots: (dots: Dot[]) => void;
  setSelected: (id: string) => void;
}) => {
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const initialPinchDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);

  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef({
    scale: 2,
    translateX: 0,
    translateY: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [props]);

  useEffect(() => {
    drawCanvas();
  }, [props]);

  //set the intial translation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentDiv = canvas.parentElement;
    const { width, height } = parentDiv.getBoundingClientRect();

    // Set initial translation to center (0, 0)
    transformRef.current = {
      ...transformRef.current,
      translateX: width / 2,
      translateY: height / 2,
    };

    // Load SVG
    const img = new Image();
    img.src = 'depot.svg';
    img.onload = () => {
      svgImageRef.current = img;
      drawCanvas();
    };
  }, []);

  function handleResize() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentDiv = canvas.parentElement;
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

      drawCanvas();
    }
  }

  useEffect(() => {
    // Load SVG
    const img = new Image();
    img.src = 'depot.svg';
    img.onload = () => {
      console.log('svg loaded', img.width, img.height);
      svgImageRef.current = img;
      drawCanvas();
    };
  }, []);

  function drawCanvas() {
    const ctx = canvasRef.current?.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    if (ctx) {
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

      // Draw grid
      const gridSize = 10;
      ctx.strokeStyle = '#e0e0e050';
      ctx.lineWidth = 0.5; // Set the stroke width

      for (let x = -width; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -height);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -height; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw SVG
      if (svgImageRef.current) {
        ctx.drawImage(svgImageRef.current, -55, -70);
      }

      // Draw dots

      props.dots.forEach((dot) => {
        if (dot.id === props.selected_id) {
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

      ctx.restore();
    }
  }

  const handleMouseMove = (e) => {
    setIsDragging(true);
    if (isDraggingCanvas) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      transformRef.current = {
        ...transformRef.current,
        translateX: transformRef.current.translateX + dx,
        translateY: transformRef.current.translateY + dy,
      };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        (e.clientX - rect.left - transformRef.current.translateX) /
        transformRef.current.scale;
      const y =
        (e.clientY - rect.top - transformRef.current.translateY) /
        transformRef.current.scale;
      props.updateDots(
        props.dots.map((dot) => (dot.isDragging ? { ...dot, x, y } : dot)),
      );
    }

    drawCanvas();
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = transformRef.current.scale * scaleAmount;

    const prev = transformRef.current;
    // Adjust translation to keep zoom centered on the mouse position

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newTranslateX =
      mouseX - ((mouseX - prev.translateX) * newScale) / prev.scale;
    const newTranslateY =
      mouseY - ((mouseY - prev.translateY) * newScale) / prev.scale;
    transformRef.current = {
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY,
    };

    drawCanvas();
  };

  /////////////////////////// MOVE EVENTS ///////////////////////////

  const handleMouseDown = (e) => {
    e.preventDefault();
    move(e);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      setIsPinching(true);
      initialPinchDistanceRef.current = getPinchDistance(e.touches);
      initialScaleRef.current = transformRef.current.scale;
    }
    move(e.touches[0]);
  };

  function move(event: Touch | MouseEvent) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x =
      (event.clientX - rect.left - transformRef.current.translateX) /
      transformRef.current.scale;
    const y =
      (event.clientY - rect.top - transformRef.current.translateY) /
      transformRef.current.scale;

    if (!dotClicked(x, y)) {
      setIsDraggingCanvas(true);
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isPinching && e.touches.length === 2) {
      const newPinchDistance = getPinchDistance(e.touches);
      const scaleAmount = newPinchDistance / initialPinchDistanceRef.current;
      const newScale = initialScaleRef.current * scaleAmount;

      const rect = canvasRef.current.getBoundingClientRect();
      const centerX =
        (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY =
        (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      const newTranslateX =
        centerX -
        ((centerX - transformRef.current.translateX) * newScale) /
          transformRef.current.scale;
      const newTranslateY =
        centerY -
        ((centerY - transformRef.current.translateY) * newScale) /
          transformRef.current.scale;

      transformRef.current = {
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      };

      drawCanvas();
    }

    const touch = e.touches[0];
    if (isDraggingCanvas) {
      const dx = touch.clientX - lastMousePosRef.current.x;
      const dy = touch.clientY - lastMousePosRef.current.y;
      transformRef.current = {
        ...transformRef.current,
        translateX: transformRef.current.translateX + dx,
        translateY: transformRef.current.translateY + dy,
      };
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
    } else {
      const rect = canvasRef.current.getBoundingClientRect();
      const x =
        (touch.clientX - rect.left - transformRef.current.translateX) /
        transformRef.current.scale;
      const y =
        (touch.clientY - rect.top - transformRef.current.translateY) /
        transformRef.current.scale;
      props.updateDots(
        props.dots.map((dot) => (dot.isDragging ? { ...dot, x, y } : dot)),
      );
    }

    drawCanvas();
  };

  /////////////////////////// END MOVE EVENTS ///////////////////////////

  const handleTouchEnd = () => {
    setIsDraggingCanvas(false);
    endMove();
  };

  const handleMouseUp = () => {
    endMove();
  };

  function endMove() {
    setIsDraggingCanvas(false);
    props.updateDots(
      props.dots.map((dot) => ({
        ...dot,
        isDragging: false,
      })),
    );
  }

  const getPinchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleClick = (e) => {
    console.log('click', e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x =
      (e.clientX - rect.left - transformRef.current.translateX) /
      transformRef.current.scale;
    const y =
      (e.clientY - rect.top - transformRef.current.translateY) /
      transformRef.current.scale;

    const clickedDot = props.dots.filter((dot) => {
      return Math.hypot(dot.x - x, dot.y - y) < dot.radius + 1;
    });

    if (clickedDot.length > 0) {
      props.setSelected(clickedDot[0].id);
    }
  };

  function dotClicked(x: number, y: number) {
    return props.dots.some((dot) => {
      if (dot.draggable && Math.hypot(dot.x - x, dot.y - y) < dot.radius + 1) {
        props.updateDots(
          props.dots.map((d) =>
            d.x === dot.x && d.y === dot.y ? { ...d, isDragging: true } : d,
          ),
        );
        return true;
      }
      return false;
    });
  }

  return (
    <div className="max-h-96 touch-none">
      <canvas
        className="w-full"
        ref={canvasRef}
        width={800}
        height={1200}
        // style={{ width: '100%', height: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      ></canvas>
    </div>
  );
};

export default DraggableDotsCanvas;
