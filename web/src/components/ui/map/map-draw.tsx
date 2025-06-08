import { useRef, useState } from 'react';
import { Canvas } from './canvas';
import { Line, Transform } from './types';
import { drawLines, drawPoints } from './utils';

export default function MapDraw({
  lines,
  setLines,
}: {
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
}) {
  // map state

  const lastPointPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);
  const [style, setStyle] = useState<'wall' | 'mat'>('wall');
  const imageRef = useRef<HTMLImageElement | null>(null);

  function drawAfter(
    ctx: CanvasRenderingContext2D,
    transformRef: React.RefObject<Transform>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, -100, -150, 200, 250);
    }
    // draw placemarker rectangle
    ctx.setLineDash([10]);
    ctx.strokeStyle = '#aeaeae';
    ctx.lineWidth = 3;
    ctx.strokeRect(-100, -150, 200, 250);
    ctx.fillStyle = '#aeaeae';
    ctx.fillText('Draw layout within the guide', -100, 120);

    // draw lines and points
    ctx.setLineDash([]);
    drawLines({ lines: lines, areas: [] }, ctx);

    drawPoints(
      lines[
        activeLineIndex >= lines.length ? lines.length - 1 : activeLineIndex
      ],
      ctx,
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        // Create and store the Image object in the ref
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imageRef.current = img;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  function preDrag(click: { x: number; y: number }) {
    const line = lines[activeLineIndex];
    for (const point of line.points) {
      const distance = Math.hypot(point.x - click.x, point.y - click.y);
      const radius = 5; // Define the radius for the clickable area around the point
      if (distance < radius + 1) {
        lastPointPosition.current = { x: point.x, y: point.y };
        setLines((prevLines) =>
          prevLines.map((line) => ({
            ...line,
            points: line.points.map((point_temp) =>
              point.x === point_temp.x && point.y === point_temp.y
                ? { ...point_temp, isDragging: true }
                : point_temp,
            ),
          })),
        );
        return false;
      }
    }
    return true;
  }

  function onClick(click: { x: number; y: number }) {
    let lineClicked: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      i: number;
    } | null = null;
    const line = lines[activeLineIndex];
    for (let i = 0; i < line.points.length - 1; i++) {
      const startX = line.points[i].x;
      const startY = line.points[i].y;
      const endX = line.points[i + 1].x;
      const endY = line.points[i + 1].y;

      // Check if the click is within the stroke of the line
      const distance =
        Math.abs(
          (endY - startY) * click.x -
            (endX - startX) * click.y +
            endX * startY -
            endY * startX,
        ) / Math.hypot(endX - startX, endY - startY);

      const isWithinSegment =
        click.x >= Math.min(startX, endX) &&
        click.x <= Math.max(startX, endX) &&
        click.y >= Math.min(startY, endY) &&
        click.y <= Math.max(startY, endY);

      const lineWidth = 5; // Define the clickable width of the line
      if (distance <= lineWidth && isWithinSegment) {
        lineClicked = { startX, startY, endX, endY, i };
        break;
      }
    }

    let pointClicked: { x: number; y: number } | null = null;

    lines[activeLineIndex].points.forEach((point) => {
      const distance = Math.hypot(point.x - click.x, point.y - click.y);
      const radius = 5; // Define the radius for the clickable area around the point
      if (distance < radius + 1) {
        pointClicked = point; // Updated to store the actual point object
      }
    });

    if (pointClicked != null) {
      if (
        !lines[activeLineIndex].joined &&
        pointClicked.x === lines[activeLineIndex].points[0].x &&
        pointClicked.y === lines[activeLineIndex].points[0].y
      ) {
        setLines((prevLines) => {
          const updatedLines = [...prevLines];
          updatedLines[activeLineIndex].joined = true;
          return updatedLines;
        });
      } else {
        // Remove the clicked point from the points array
        if (
          lastPointPosition.current.x === pointClicked.x &&
          lastPointPosition.current.y === pointClicked.y
        ) {
          // Check if the point is different from the first point
          setLines((prevLines) => {
            const updatedLines = [...prevLines];
            updatedLines[activeLineIndex].points = updatedLines[
              activeLineIndex
            ].points.filter(
              (p) => p.x !== pointClicked.x || p.y !== pointClicked.y,
            );
            return updatedLines;
          });
        }
      }
    } else if (lineClicked != null) {
      // add a new point inbetween the two points of the line

      setLines((prevLines) => {
        const updatedLines = prevLines.map((line, index) =>
          index === activeLineIndex
            ? {
                ...line,
                points: [
                  ...line.points.slice(0, lineClicked.i + 1),
                  { x: click.x, y: click.y, isDragging: false },
                  ...line.points.slice(lineClicked.i + 1),
                ],
              }
            : line,
        );
        return updatedLines;
      });
    } else {
      setLines((prevLines) => {
        const updatedLines = [...prevLines];
        if (
          updatedLines[activeLineIndex].points.length === 0 ||
          updatedLines[activeLineIndex].points[
            updatedLines[activeLineIndex].points.length - 1
          ].x !== click.x ||
          updatedLines[activeLineIndex].points[
            updatedLines[activeLineIndex].points.length - 1
          ].y !== click.y
        ) {
          updatedLines[activeLineIndex].points.push({
            x: click.x,
            y: click.y,
            isDragging: false,
          });
        }
        return updatedLines;
      });
    }
  }

  function onMove(click: { x: number; y: number }) {
    if (lines.some((line) => line.points.some((point) => point.isDragging))) {
      setLines((prevLines) =>
        prevLines.map((line) => ({
          ...line,
          points: line.points.map((point) =>
            point.isDragging ? { ...point, x: click.x, y: click.y } : point,
          ),
        })),
      );
    }
  }

  function onUp() {
    console.log('onUp');
    setLines((prevLines) =>
      prevLines.map((line) => ({
        ...line,
        points: line.points.map((point) => ({
          ...point,
          isDragging: false,
        })),
      })),
    );
  }

  function updateStyle(style: 'mat' | 'wall') {
    setStyle(style);
    setLines((prevLines) => {
      const updatedLines = [...prevLines];
      updatedLines[activeLineIndex].style = style;
      return updatedLines;
    });
  }

  return (
    <div className="relative">
      <div className="">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer shadow-md p-2 rounded-lg bg-white border border-gray-300"
        />
      </div>
      <Canvas
        drawAfter={drawAfter}
        preDrag={preDrag}
        onClick={onClick}
        onMove={onMove}
        onUp={onUp}
      />
      <div className="absolute top-2 w-full">
        <div className="mx-auto w-fit">
          <button
            className={`shadow-md p-2 px-6 rounded-l-lg font-semibold cursor-pointer ${
              style == 'wall'
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-violet-200 hover:bg-violet-300 text-gray-900'
            }`}
            onClick={() => updateStyle('wall')}
          >
            Wall
          </button>
          <button
            className={`shadow-md p-2  rounded-r-lg font-semibold cursor-pointer ${
              style == 'mat'
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-violet-200 hover:bg-violet-300 text-gray-900'
            }`}
            onClick={() => updateStyle('mat')}
          >
            Pad Area
          </button>
        </div>
      </div>
      <div className="flex flex-col absolute top-4 right-4 rounded-lg shadow-lg p-4 bg-white">
        {lines.map((line, index) => (
          <div
            className={`flex px-2 py-1 items-center cursor-pointer ${
              index == activeLineIndex ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            <span key={index} onClick={() => setActiveLineIndex(index)}>
              <span className="size-6">
                {line.joined ? (
                  <span className="!text-[22px] relative top-[4px] material-symbols-rounded  text-gray-700">
                    activity_zone
                  </span>
                ) : (
                  <span className="!text-[22px] relative top-[4px] material-symbols-rounded  text-gray-700">
                    polyline
                  </span>
                )}
              </span>
              <span className="ml-2 mr-4">
                {line.style == 'mat' ? 'Pad' : 'Wall'}
              </span>
            </span>
            <button
              onClick={() => {
                if (lines.length > 1) {
                  setLines((prevLines) => {
                    const updatedLines = [...prevLines];

                    if (activeLineIndex >= index) {
                      setActiveLineIndex(Math.max(activeLineIndex - 1, 0));
                      console.log(
                        'Active line index updated to:',
                        Math.max(activeLineIndex - 1, 0),
                      );
                    }
                    updatedLines.splice(index, 1);
                    return updatedLines;
                  });
                }
              }}
              className="!text-[22px]  px-2  material-symbols-rounded font-bold ml-auto cursor-pointer hover:bg-gray-50 rounded-full text-gray-200 hover:text-gray-500"
            >
              delete
            </button>
          </div>
        ))}
        <button
          className="bg-green-600 hover:bg-green-700 cursor-pointer text-white font-semibold px-2 py-1 rounded-lg flex justify-center mt-2"
          onClick={() => {
            setLines((prevLines) => [
              ...prevLines,
              { joined: false, points: [], style: style },
            ]);
            setActiveLineIndex(lines.length);
          }}
        >
          New Line
        </button>
      </div>
    </div>
  );
}
