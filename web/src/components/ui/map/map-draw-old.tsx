// import { useEffect, useRef, useState } from 'react';
// import { getCoordinates } from './utils';
// import { Transform } from './types';
// import { zoomOnWheel } from './scroll';

// export interface Line {
//   joined: boolean;
//   points: { x: number; y: number; isDragging: boolean }[];
//   style: 'wall' | 'mat';
// }

// export default function MapDraw() {
//   // map state
//   const [lines, setLines] = useState<Line[]>([
//     { joined: false, points: [], style: 'wall' },
//   ]);
//   const lastPointPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
//   const [style, setStyle] = useState<'wall' | 'mat'>('wall');

//   // transform boilerplater
//   const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const transformRef = useRef({
//     scale: 1,
//     translateX: 0,
//     translateY: 0,
//   });
//   const lastMousePosRef = useRef({ x: 0, y: 0 });
//   const firstMousePosRef = useRef({ x: 0, y: 0 });
//   //set the intial translation
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const parentDiv = canvas.parentElement;
//     const { width, height } = parentDiv.getBoundingClientRect();

//     // Set initial translation to center (0, 0)
//     transformRef.current = {
//       ...transformRef.current,
//       translateX: width / 2,
//       translateY: height / 2,
//     };

//     drawCanvas();
//   }, [canvasRef.current]);

//   useEffect(() => {
//     drawCanvas();
//   }, [lines, activeLineIndex]);

//   useEffect(() => {
//     window.addEventListener('resize', handleResize);
//     handleResize();

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   function handleResize() {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const parentDiv = canvas.parentElement;
//     const { width, height } = parentDiv.getBoundingClientRect();
//     const prevWidth = canvas.width;
//     const prevHeight = canvas.height;

//     const dpr = window.devicePixelRatio || 1;

//     if (width !== prevWidth || height !== prevHeight) {
//       canvas.width = width * dpr;
//       canvas.height = height * dpr;

//       // Adjust translation to keep the center point in the same place
//       transformRef.current = {
//         ...transformRef.current,
//         translateX:
//           transformRef.current.translateX + (width - prevWidth / dpr) / 2,
//         translateY:
//           transformRef.current.translateY + (height - prevHeight / dpr) / 2,
//       };

//       drawCanvas();
//     }
//   }

//   function drawCanvas() {
//     const ctx = canvasRef.current?.getContext('2d');
//     const dpr = window.devicePixelRatio || 1;
//     const canvas = canvasRef.current;

//     if (!ctx || !canvas) return;

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = 'high';
//     const { width, height } = ctx.canvas;

//     ctx.clearRect(0, 0, width, height);
//     ctx.save();

//     ctx.translate(
//       transformRef.current.translateX * dpr,
//       transformRef.current.translateY * dpr,
//     );

//     ctx.scale(
//       transformRef.current.scale * dpr,
//       transformRef.current.scale * dpr,
//     );

//     // draw placemarker rectangle
//     ctx.setLineDash([10]);
//     ctx.strokeStyle = '#aeaeae';
//     ctx.lineWidth = 3;
//     ctx.strokeRect(-100, -150, 200, 250);
//     ctx.fillStyle = '#aeaeae';
//     ctx.fillText('Draw layout within the guide', -100, 120);

//     // draw lines and points
//     ctx.setLineDash([]);
//     ctx.lineWidth = 4;

//     lines.forEach((line) => {
//       if (line.style == 'mat') drawLine(line);
//     });
//     lines.forEach((line) => {
//       if (line.style == 'wall') drawLine(line);
//     });

//     drawPoints(lines[activeLineIndex]);

//     ctx.restore();
//   }

//   function drawPoints(line: Line) {
//     const ctx = canvasRef.current?.getContext('2d');
//     if (!ctx) return;

//     line.points.forEach((point, index) => {
//       if (index === 0) {
//         ctx.fillStyle = '#ff00005e';
//       } else if (index === line.points.length - 1) {
//         ctx.fillStyle = '#00ff005e';
//       } else {
//         ctx.fillStyle = '#0000ff5e';
//       }
//       ctx.beginPath();
//       ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.closePath();
//     });
//   }

//   function drawLine(line: Line) {
//     const ctx = canvasRef.current?.getContext('2d');
//     if (!ctx || line.points.length < 2) return;

//     if (line.style == 'mat') {
//       ctx.strokeStyle = '#9e9e9e';
//     } else if (line.style == 'wall') {
//       ctx.strokeStyle = '#000000';
//     }

//     var startX = null,
//       startY = null;
//     var endX = null,
//       endY = null;

//     const coordinates = line.points.slice();

//     if (!line.joined) {
//       // If the line is joined, we need to close the path by connecting the last point to the first
//       if (coordinates.length > 1) {
//         coordinates.unshift(coordinates[0]);
//         coordinates.push(coordinates[coordinates.length - 1]);
//       }
//     } else {
//       // If not joined, we can just draw the points as they are
//       if (coordinates.length > 3) {
//         coordinates.push(coordinates[0]);
//         coordinates.push(coordinates[1]);
//         coordinates.push(coordinates[2]); // Added to ensure the third point is included
//       }
//     }

//     const curve_ratio = 0.8;
//     for (let i = 0; i < coordinates.length - 2; i++) {
//       // starting point is 90% towards the next point (point b)
//       startX =
//         coordinates[i].x * (1 - curve_ratio) +
//         coordinates[i + 1].x * curve_ratio;
//       startY =
//         coordinates[i].y * (1 - curve_ratio) +
//         coordinates[i + 1].y * curve_ratio;

//       // control point is the next point in the array
//       const controlX = coordinates[i + 1].x; // control point x
//       const controlY = coordinates[i + 1].y; // control point y

//       if (endX != null && endY != null) {
//         // draw a straigntline between startX and endX
//         ctx.beginPath();
//         ctx.moveTo(startX, startY);
//         ctx.lineTo(endX, endY);
//         ctx.stroke();
//       }

//       // end point is halfway between the two next points
//       endX =
//         coordinates[i + 1].x * curve_ratio +
//         coordinates[i + 2].x * (1 - curve_ratio);
//       endY =
//         coordinates[i + 1].y * curve_ratio +
//         coordinates[i + 2].y * (1 - curve_ratio);

//       ctx.beginPath();
//       ctx.moveTo(startX, startY);
//       ctx.quadraticCurveTo(controlX, controlY, endX, endY);
//       ctx.stroke();
//     }
//   }

//   function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
//     console.log('lines', lines);
//     if (!canvasRef.current) return;
//     const ctx = canvasRef.current.getContext('2d');
//     if (!ctx) return;

//     const click = getCoordinates(
//       event,
//       canvasRef.current,
//       transformRef.current,
//     );

//     if (!click) return;

//     var lineClicked = null;
//     const line = lines[activeLineIndex];
//     for (let i = 0; i < line.points.length - 1; i++) {
//       const startX = line.points[i].x;
//       const startY = line.points[i].y;
//       const endX = line.points[i + 1].x;
//       const endY = line.points[i + 1].y;

//       // Create a path for the line segment
//       const linePath = new Path2D();
//       linePath.moveTo(startX, startY);
//       linePath.lineTo(endX, endY);

//       // Check if the click is within the stroke of the line
//       if (ctx.isPointInStroke(linePath, click.x, click.y)) {
//         lineClicked = linePath;
//         break;
//       }
//     }

//     var pointClicked: { x: number; y: number } | null = null;

//     lines[activeLineIndex].points.forEach((point) => {
//       const distance = Math.hypot(point.x - click.x, point.y - click.y);
//       const radius = 5; // Define the radius for the clickable area around the point
//       if (distance < radius + 1) {
//         pointClicked = point; // Updated to store the actual point object
//       }
//     });

//     setIsDraggingCanvas(false);

//     if (
//       isDraggingCanvas &&
//       lastMousePosRef.current.x != firstMousePosRef.current.x
//     ) {
//       return;
//     }

//     if (pointClicked != null) {
//       if (
//         !lines[activeLineIndex].joined &&
//         pointClicked.x === lines[activeLineIndex].points[0].x &&
//         pointClicked.y === lines[activeLineIndex].points[0].y
//       ) {
//         setLines((prevLines) => {
//           const updatedLines = [...prevLines];
//           updatedLines[activeLineIndex].joined = true;
//           return updatedLines;
//         });
//       } else {
//         // Remove the clicked point from the points array
//         if (
//           lastPointPosition.current.x === pointClicked.x &&
//           lastPointPosition.current.y === pointClicked.y
//         ) {
//           // Check if the point is different from the first point
//           setLines((prevLines) => {
//             const updatedLines = [...prevLines];
//             updatedLines[activeLineIndex].points = updatedLines[
//               activeLineIndex
//             ].points.filter(
//               (p) => p.x !== pointClicked.x || p.y !== pointClicked.y,
//             );
//             return updatedLines;
//           });
//         }
//       }
//     } else if (lineClicked) {
//       // add a new point inbetween the two points of the line
//       lines.forEach((line, lineIndex) => {
//         for (let i = 0; i < line.points.length - 1; i++) {
//           const startX = line.points[i].x;
//           const startY = line.points[i].y;
//           const endX = line.points[i + 1].x;
//           const endY = line.points[i + 1].y;

//           const linePath = new Path2D();
//           linePath.moveTo(startX, startY);
//           linePath.lineTo(endX, endY);

//           if (ctx.isPointInStroke(linePath, click.x, click.y)) {
//             const midX = click.x; //(startX + endX) / 2;
//             const midY = click.y; //(startY + endY) / 2;
//             console.log('Adding point at:', midX, midY);
//             setLines((prevLines) => {
//               const updatedLines = prevLines.map((line, index) =>
//                 index === lineIndex
//                   ? {
//                       ...line,
//                       points: [
//                         ...line.points.slice(0, i + 1),
//                         { x: midX, y: midY, isDragging: false },
//                         ...line.points.slice(i + 1),
//                       ],
//                     }
//                   : line,
//               );
//               console.log('Updated points:', updatedLines);
//               return updatedLines;
//             });
//             break;
//           }
//         }
//       });
//     } else {
//       setLines((prevLines) => {
//         const updatedLines = [...prevLines];
//         if (
//           updatedLines[activeLineIndex].points.length === 0 ||
//           updatedLines[activeLineIndex].points[
//             updatedLines[activeLineIndex].points.length - 1
//           ].x !== click.x ||
//           updatedLines[activeLineIndex].points[
//             updatedLines[activeLineIndex].points.length - 1
//           ].y !== click.y
//         ) {
//           updatedLines[activeLineIndex].points.push({
//             x: click.x,
//             y: click.y,
//             isDragging: false,
//           });
//         }
//         return updatedLines;
//       });
//     }
//   }

//   function clickedToPoint(click: { x: number; y: number }) {
//     if (!canvasRef.current) return;
//     const ctx = canvasRef.current.getContext('2d');
//     if (!ctx) return;
//     lines.forEach((line: Line) => {
//       line.points.forEach((point) => {
//         const distance = Math.hypot(point.x - click.x, point.y - click.y);
//         const radius = 5; // Define the radius for the clickable area around the point
//         if (distance < radius) {
//           return point;
//         }
//       });
//     });

//     return null;
//   }

//   function handleMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
//     event.preventDefault();
//     if (!canvasRef.current) {
//       return;
//     }

//     var point_clicked = false;

//     const click = getCoordinates(
//       event,
//       canvasRef.current,
//       transformRef.current,
//     );

//     if (!click) return;
//     const line = lines[activeLineIndex];
//     line.points.forEach((point) => {
//       const distance = Math.hypot(point.x - click.x, point.y - click.y);
//       const radius = 5; // Define the radius for the clickable area around the point
//       if (distance < radius + 1) {
//         lastPointPosition.current = { x: point.x, y: point.y };
//         point_clicked = true;
//         setLines((prevLines) =>
//           prevLines.map((line) => ({
//             ...line,
//             points: line.points.map((point_temp) =>
//               point.x === point_temp.x && point.y === point_temp.y
//                 ? { ...point_temp, isDragging: true }
//                 : point_temp,
//             ),
//           })),
//         );
//       }
//     });

//     if (!point_clicked) {
//       setIsDraggingCanvas(true);
//       lastMousePosRef.current = { x: event.clientX, y: event.clientY };
//       firstMousePosRef.current = { x: event.clientX, y: event.clientY };
//     }
//   }

//   const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
//     if (!canvasRef.current) {
//       return;
//     }
//     // setIsDragging(true);
//     if (isDraggingCanvas) {
//       const dx = e.clientX - lastMousePosRef.current.x;
//       const dy = e.clientY - lastMousePosRef.current.y;
//       transformRef.current = {
//         ...transformRef.current,
//         translateX: transformRef.current.translateX + dx,
//         translateY: transformRef.current.translateY + dy,
//       };
//       lastMousePosRef.current = { x: e.clientX, y: e.clientY };
//       drawCanvas();
//     } else {
//       const coordinates = getCoordinates(
//         e,
//         canvasRef.current,
//         transformRef.current,
//       );
//       if (!coordinates) return;
//       const { x, y } = coordinates;

//       if (lines.some((line) => line.points.some((point) => point.isDragging))) {
//         setLines((prevLines) =>
//           prevLines.map((line) => ({
//             ...line,
//             points: line.points.map((point) =>
//               point.isDragging ? { ...point, x: x, y: y } : point,
//             ),
//           })),
//         );
//       }
//     }
//   };

//   const handleMouseUp = () => {
//     endMove();
//   };

//   function endMove() {
//     setLines((prevLines) =>
//       prevLines.map((line) => ({
//         ...line,
//         points: line.points.map((point) => ({ ...point, isDragging: false })),
//       })),
//     );
//   }

//   function updateStyle(style: 'mat' | 'wall') {
//     setStyle(style);
//     setLines((prevLines) => {
//       const updatedLines = [...prevLines];
//       updatedLines[activeLineIndex].style = style;
//       return updatedLines;
//     });
//   }

//   return (
//     <div className="max-h-96 touch-none relative">
//       <canvas
//         className="w-full"
//         ref={canvasRef}
//         width={800}
//         height={1200}
//         // style={{ width: '100%', height: '100%' }}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onWheel={(event) => {
//           zoomOnWheel(event, drawCanvas, transformRef, canvasRef);
//         }}
//         //   onTouchStart={handleTouchStart}
//         //   onTouchMove={handleTouchMove}
//         //   onTouchEnd={handleTouchEnd}
//         onClick={handleClick}
//       ></canvas>
//       <div className="absolute top-0 w-full">
//         <div className="mx-auto w-fit">
//           <button
//             className={`shadow-md p-2 px-6 rounded-l-lg font-semibold cursor-pointer ${
//               style == 'wall'
//                 ? 'bg-violet-600 hover:bg-violet-700 text-white'
//                 : 'bg-violet-200 hover:bg-violet-300 text-gray-900'
//             }`}
//             onClick={() => updateStyle('wall')}
//           >
//             Wall
//           </button>
//           <button
//             className={`shadow-md p-2  rounded-r-lg font-semibold cursor-pointer ${
//               style == 'mat'
//                 ? 'bg-violet-600 hover:bg-violet-700 text-white'
//                 : 'bg-violet-200 hover:bg-violet-300 text-gray-900'
//             }`}
//             onClick={() => updateStyle('mat')}
//           >
//             Pad Area
//           </button>
//         </div>
//       </div>
//       <div className="flex flex-col absolute top-4 right-4 rounded-lg shadow-lg p-4 bg-white">
//         {lines.map((line, index) => (
//           <div
//             className={`flex px-2 py-1 items-center cursor-pointer ${
//               index == activeLineIndex ? 'bg-gray-100 font-semibold' : ''
//             }`}
//           >
//             <span key={index} onClick={() => setActiveLineIndex(index)}>
//               <span className="mr-2">
//                 {line.style == 'mat' ? 'Pad' : 'Wall'} {index + 1}:
//               </span>
//               <span className="text-xs">
//                 {line.joined ? 'Joined' : 'Not Joined'}
//               </span>
//             </span>
//             <button
//               onClick={() => {
//                 setLines((prevLines) => {
//                   const updatedLines = [...prevLines];

//                   if (activeLineIndex >= index) {
//                     setActiveLineIndex(Math.max(activeLineIndex - 1, 0));
//                   }
//                   updatedLines.splice(index, 1);
//                   return updatedLines;
//                 });
//               }}
//               className="px-2  font-bold ml-auto cursor-pointer hover:bg-gray-50 rounded-full"
//             >
//               x
//             </button>
//           </div>
//         ))}
//         <button
//           className="bg-green-600 hover:bg-green-700 cursor-pointer text-white font-semibold px-2 py-1 rounded-lg flex justify-center mt-2"
//           onClick={() => {
//             setLines((prevLines) => [
//               ...prevLines,
//               { joined: false, points: [], style: style },
//             ]);
//             setActiveLineIndex(lines.length);
//           }}
//         >
//           New Line
//         </button>
//       </div>
//     </div>
//   );
// }
