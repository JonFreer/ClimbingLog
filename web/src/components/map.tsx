import React, { useRef, useState, useEffect } from "react";

const DraggableDotsCanvas = () => {
  console.log("Asset render");

  const dotsRef = useRef([
    { x: 50, y: 50, isDragging: false ,complete: false},
    { x: 150, y: 150, isDragging: false,complete: false} ,
    { x: 0, y: 0, isDragging: false,complete: true} ,
  ]);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);

 const lastMousePosRef = useRef({ x: 0, y: 0 });
  const transformRef = useRef({
    scale: 2,
    translateX: 0,
    translateY: 0
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgImageRef = useRef<HTMLImageElement | null>(null);

  console.log(transformRef.current);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    img.src = "depot.svg";
    img.onload = () => {
      console.log("svg loaded", img);
      svgImageRef.current = img;
      drawCanvas();
    };
  }, []);



  function handleResize() {
    console.log("canvasRef.current", canvasRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parentDiv = canvas.parentElement;
    const { width, height } = parentDiv.getBoundingClientRect();
    const prevWidth = canvas.width;
    const prevHeight = canvas.height;

    if (width !== prevWidth || height !== prevHeight) {
      canvas.width = width;
      canvas.height = height;

      // Adjust translation to keep the center point in the same place
      transformRef.current = {
        ...transformRef.current,
        translateX: transformRef.current.translateX + (width - prevWidth) / 2,
        translateY: transformRef.current.translateY + (height - prevHeight) / 2,
      };

      drawCanvas();
    }
  };

  useEffect(() => {
    // Load SVG
    const img = new Image();
    img.src = "depot.svg";
    img.onload = () => {
      console.log("svg loaded", img);
      svgImageRef.current = img;
      drawCanvas();
    };
  }, []);


function drawCanvas(){
    console.log(transformRef.current)
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const { width, height } = ctx.canvas;
      console.log("draw", width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.save();

    ctx.translate(
    (transformRef.current.translateX ),
    (transformRef.current.translateY)
    );

    ctx.scale(transformRef.current.scale,transformRef.current.scale )


      // Draw grid
      const gridSize = 10;
      ctx.strokeStyle = "#e0e0e050";
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
        ctx.drawImage(svgImageRef.current, -150, -70);
        console.log("yes svg");
      } else {
        console.log("no svg");
      }

      // Draw dots
      dotsRef.current.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = dot.complete? "red":'#FF00005e';
        ctx.fill();
        ctx.closePath();
      });



      ctx.restore();
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - transformRef.current.translateX) / transformRef.current.scale;
    const y = (e.clientY - rect.top - transformRef.current.translateY) / transformRef.current.scale;

    const dotClicked = dotsRef.current.some((dot) => {
      if (Math.hypot(dot.x - x, dot.y - y) < 5) {
        dotsRef.current = dotsRef.current.map((d) =>
            d.x === dot.x && d.y === dot.y ? { ...d, isDragging: true } : d
    )
        return true;
      }
      return false;
    });
    console.log("dot clicked",dotClicked)
    if (!dotClicked) {
      setIsDraggingCanvas(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    }
  };

  const handleMouseMove = (e) => {
      if (isDraggingCanvas) {
          const dx = e.clientX - lastMousePosRef.current.x;
          const dy = e.clientY - lastMousePosRef.current.y;
          transformRef.current = {
              ...transformRef.current,
              translateX: transformRef.current.translateX + dx,
              translateY: transformRef.current.translateY + dy,
          };
          lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      } else {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - transformRef.current.translateX) / transformRef.current.scale;
          const y = (e.clientY - rect.top - transformRef.current.translateY) / transformRef.current.scale;
          dotsRef.current = dotsRef.current.map((dot) =>
            dot.isDragging ? { ...dot, x, y } : dot
        )
       
      }

      drawCanvas();
  };

  const handleMouseUp = () => {
      setIsDraggingCanvas(false);
      dotsRef.current = dotsRef.current.map((dot) => ({ ...dot, isDragging: false }))
  };

  const handleWheel = (e) => {
      e.preventDefault();
      const scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = transformRef.current.scale * scaleAmount;

      const prev = transformRef.current ;
      // Adjust translation to keep zoom centered on the mouse position
    
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newTranslateX = mouseX - ((mouseX - prev.translateX)) * newScale / prev.scale;
        const newTranslateY = mouseY - ((mouseY - prev.translateY)) * newScale / prev.scale;
        transformRef.current = {
            scale: newScale,
            translateX: newTranslateX,
            translateY: newTranslateY,
        };


      drawCanvas();
  };


  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x =
      (touch.clientX - rect.left - transformRef.current.translateX) /
      transformRef.current.scale;
    const y =
      (touch.clientY - rect.top - transformRef.current.translateY) /
      transformRef.current.scale;

    const dotClicked = dotsRef.current.some((dot) => {
      if (Math.hypot(dot.x - x, dot.y - y) < 5) {
        dotsRef.current = dotsRef.current.map((d) =>
          d.x === dot.x && d.y === dot.y ? { ...d, isDragging: true } : d
        );
        return true;
      }
      return false;
    });
    console.log("dot clicked", dotClicked);
    if (!dotClicked) {
      setIsDraggingCanvas(true);
      lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e) => {
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
      dotsRef.current = dotsRef.current.map((dot) =>
        dot.isDragging ? { ...dot, x, y } : dot
      );
    }

    drawCanvas();
  };

  const handleTouchEnd = () => {
    setIsDraggingCanvas(false);
    dotsRef.current = dotsRef.current.map((dot) => ({
      ...dot,
      isDragging: false,
    }));
  };

  return (
    <div className="max-h-96 ">
      <canvas
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
      ></canvas>
    </div>
  );
};

export default DraggableDotsCanvas;
