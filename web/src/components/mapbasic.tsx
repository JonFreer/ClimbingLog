import React, { useRef, useState, useEffect } from "react";

const DraggableDotsCanvas = () => {
  console.log("Asset render");
  const [dots, setDots] = useState([
    { x: 50, y: 50, isDragging: false },
    { x: 150, y: 150, isDragging: false },
  ]);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({
    scale: 2,
    translateX: 50,
    translateY: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null);

  console.log(transform);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleResize(){
    console.log("canvasRef.current", canvasRef.current);
    const canvas = canvasRef.current;
    const parentDiv = canvas.parentElement;
    const { width, height } = parentDiv.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    drawCanvas();
  };

  useEffect(() => {
    // Load SVG
    const img = new Image();
    img.src = "depot.svg";
    img.onload = () => {
      console.log("svg loaded", img);
      setSvgImage(img);
      drawCanvas();
    };
  }, []);

function drawCanvas(){
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      const { width, height } = ctx.canvas;
      console.log("draw", width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(
        transform.translateX + width / 2,
        transform.translateY + height / 2
      );
      ctx.scale(transform.scale, transform.scale);
      // Draw grid
      const gridSize = 10;
      ctx.strokeStyle = "#e0e0e050";
      ctx.lineWidth = 0.5; // Set the stroke width

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      //aply gradient

      ctx.restore(); // Restore to remove transformations
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) / 2,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.save(); // Save again to apply transformations for the rest of the drawing
      ctx.translate(
        transform.translateX + width / 2,
        transform.translateY + height / 2
      );
      ctx.scale(transform.scale, transform.scale);

      // Draw SVG
      if (svgImage) {
        ctx.drawImage(svgImage, 0, 0);
        console.log("yes svg");
      } else {
        console.log("no svg");
      }

      // Draw dots
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      });

      ctx.restore();
    }
  };

//   const handleMouseDown = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = (e.clientX - rect.left - transform.translateX) / transform.scale;
//     const y = (e.clientY - rect.top - transform.translateY) / transform.scale;

//     const dotClicked = dots.some((dot) => {
//       if (Math.hypot(dot.x - x, dot.y - y) < 5) {
//         setDots((prevDots) =>
//           prevDots.map((d) =>
//             d.x === dot.x && d.y === dot.y ? { ...d, isDragging: true } : d
//           )
//         );
//         return true;
//       }
//       return false;
//     });

//     if (!dotClicked) {
//       setIsDraggingCanvas(true);
//       setLastMousePos({ x: e.clientX, y: e.clientY });
//     }
//   };

  // const handleMouseMove = (e) => {
  //     if (isDraggingCanvas) {
  //         const dx = e.clientX - lastMousePos.x;
  //         const dy = e.clientY - lastMousePos.y;
  //         setTransform((prev) => ({
  //             ...prev,
  //             translateX: prev.translateX + dx,
  //             translateY: prev.translateY + dy,
  //         }));
  //         setLastMousePos({ x: e.clientX, y: e.clientY });
  //     } else {
  //         const rect = canvasRef.current.getBoundingClientRect();
  //         const x = (e.clientX - rect.left - transform.translateX) / transform.scale;
  //         const y = (e.clientY - rect.top - transform.translateY) / transform.scale;

  //         setDots((prevDots) =>
  //             prevDots.map((dot) =>
  //                 dot.isDragging ? { ...dot, x, y } : dot
  //             )
  //         );
  //     }

  //     const ctx = canvasRef.current.getContext('2d');
  //     drawCanvas(ctx);
  // };

  // const handleMouseUp = () => {
  //     setIsDraggingCanvas(false);
  //     setDots((prevDots) =>
  //         prevDots.map((dot) => ({ ...dot, isDragging: false }))
  //     );
  // };

  // const handleWheel = (e) => {
  //     e.preventDefault();
  //     const scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
  //     const newScale = transform.scale * scaleAmount;

  //     // Adjust translation to keep zoom centered on the mouse position
  //     setTransform((prev) => {
  //         const rect = canvasRef.current.getBoundingClientRect();
  //         const mouseX = e.clientX - rect.left;
  //         const mouseY = e.clientY - rect.top;
  //         const newTranslateX = mouseX - ((mouseX - prev.translateX) * newScale / prev.scale);
  //         const newTranslateY = mouseY - ((mouseY - prev.translateY) * newScale / prev.scale);
  //         return {
  //             scale: newScale,
  //             translateX: newTranslateX,
  //             translateY: newTranslateY,
  //         };
  //     });

  //     const ctx = canvasRef.current.getContext('2d');
  //     drawCanvas(ctx);
  // };

  return (
    <div className="max-h-96 ">
      <canvas
        ref={canvasRef}
        width={800}
        height={1200}
        // style={{ width: '100%', height: '100%' }}
        // onMouseDown={handleMouseDown}
        // onMouseMove={handleMouseMove}
        // onMouseUp={handleMouseUp}
        // onWheel={handleWheel}
      ></canvas>
    </div>
  );
};

export default DraggableDotsCanvas;
