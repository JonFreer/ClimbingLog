import { useRef, useState } from 'react';
import { Canvas } from './canvas';
import { Line, Transform } from './types';
import { drawLine, drawPoints } from './utils';

export interface Area {
  joined: boolean;
  points: { x: number; y: number; isDragging: boolean }[];
  style: 'wall' | 'mat';
  name: string; // Optional color property for future use
  color: string;
}

function drawText(area: Area, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0000005e';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const centerX =
    area.points.reduce((sum, point) => sum + point.x, 0) / area.points.length;
  const centerY =
    area.points.reduce((sum, point) => sum + point.y, 0) / area.points.length;
  ctx.fillText(area.name, centerX, centerY);
}

function drawPolygon(area: Area, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = area.color || '#5e5e5e5e';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  area.points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.fill();
}

export default function MapLocation({
  lines,
  areas,
  setAreas,
}: {
  lines: Line[];
  areas: Area[];
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
}) {
  const lastPointPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0);

  function drawAfter(
    ctx: CanvasRenderingContext2D,
    transformRef: React.RefObject<Transform>, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    // draw placemarker rectangle
    ctx.setLineDash([10]);
    ctx.strokeStyle = '#aeaeae';
    ctx.lineWidth = 3;
    ctx.strokeRect(-100, -150, 200, 250);
    ctx.fillStyle = '#aeaeae';
    ctx.fillText('Draw layout within the guide', -100, 120);

    // draw lines and points
    ctx.setLineDash([]);
    ctx.lineWidth = 4;

    for (const line of lines) {
      if (line.style === 'mat') {
        drawLine(line, ctx);
      }
    }
    for (const line of lines) {
      if (line.style === 'wall') {
        drawLine(line, ctx);
      }
    }

    for (const area of areas) {
      drawPolygon(area, ctx);
      drawText(area, ctx);
    }
    drawPoints(areas[activeLineIndex], ctx);
  }

  function preDrag(click: { x: number; y: number }) {
    const area = areas[activeLineIndex];
    for (const point of area.points) {
      const distance = Math.hypot(point.x - click.x, point.y - click.y);
      const radius = 5; // Define the radius for the clickable area around the point
      if (distance < radius + 1) {
        lastPointPosition.current = { x: point.x, y: point.y };
        console.log('Point clicked:', point);
        setAreas((prevAreas) =>
          prevAreas.map((area) => ({
            ...area,
            points: area.points.map((point_temp) =>
              point.x === point_temp.x && point.y === point_temp.y
                ? { ...point_temp, isDragging: true }
                : point_temp,
            ),
          })),
        );
        console.log('returning false');
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
    const area = areas[activeLineIndex];
    for (let i = 0; i < area.points.length - 1; i++) {
      const startX = area.points[i].x;
      const startY = area.points[i].y;
      const endX = area.points[i + 1].x;
      const endY = area.points[i + 1].y;

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
        console.log('Line clicked:', { startX, startY, endX, endY, i }, click);
        lineClicked = { startX, startY, endX, endY, i };
        break;
      }
    }

    let pointClicked: { x: number; y: number } | null = null;

    areas[activeLineIndex].points.forEach((point) => {
      const distance = Math.hypot(point.x - click.x, point.y - click.y);
      const radius = 5; // Define the radius for the clickable area around the point
      if (distance < radius + 1) {
        pointClicked = point; // Updated to store the actual point object
      }
    });

    if (pointClicked != null) {
      if (
        !areas[activeLineIndex].joined &&
        pointClicked.x === areas[activeLineIndex].points[0].x &&
        pointClicked.y === areas[activeLineIndex].points[0].y
      ) {
        setAreas((prevAreas) => {
          const updatedAreas = [...prevAreas];
          updatedAreas[activeLineIndex].joined = true;
          return updatedAreas;
        });
      } else {
        // Remove the clicked point from the points array
        if (
          lastPointPosition.current.x === pointClicked.x &&
          lastPointPosition.current.y === pointClicked.y
        ) {
          // Check if the point is different from the first point
          setAreas((prevAreas) => {
            const updatedAreas = [...prevAreas];
            updatedAreas[activeLineIndex].points = updatedAreas[
              activeLineIndex
            ].points.filter(
              (p) => p.x !== pointClicked.x || p.y !== pointClicked.y,
            );
            return updatedAreas;
          });
        }
      }
    } else if (lineClicked != null) {
      console.log('Line clicked:', lineClicked);
      // add a new point inbetween the two points of the line

      setAreas((prevAreas) => {
        const updatedAreas = prevAreas.map((area, index) =>
          index === activeLineIndex
            ? {
                ...area,
                points: [
                  ...area.points.slice(0, lineClicked.i + 1),
                  { x: click.x, y: click.y, isDragging: false },
                  ...area.points.slice(lineClicked.i + 1),
                ],
              }
            : area,
        );
        console.log('Updated points:', updatedAreas);
        return updatedAreas;
      });
    } else {
      setAreas((prevAreas) => {
        const updatedAreas = [...prevAreas];
        if (
          updatedAreas[activeLineIndex].points.length === 0 ||
          updatedAreas[activeLineIndex].points[
            updatedAreas[activeLineIndex].points.length - 1
          ].x !== click.x ||
          updatedAreas[activeLineIndex].points[
            updatedAreas[activeLineIndex].points.length - 1
          ].y !== click.y
        ) {
          updatedAreas[activeLineIndex].points.push({
            x: click.x,
            y: click.y,
            isDragging: false,
          });
        }
        return updatedAreas;
      });
    }
  }

  function onMove(click: { x: number; y: number }) {
    if (areas.some((area) => area.points.some((point) => point.isDragging))) {
      setAreas((prevAreas) =>
        prevAreas.map((area) => ({
          ...area,
          points: area.points.map((point) =>
            point.isDragging ? { ...point, x: click.x, y: click.y } : point,
          ),
        })),
      );
    }
  }

  function onUp() {
    console.log('onUp');
    setAreas((prevAreas) =>
      prevAreas.map((area) => ({
        ...area,
        points: area.points.map((point) => ({
          ...point,
          isDragging: false,
        })),
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
      />
      <div className="absolute top-2 w-full">
        <div className="mx-auto w-fit">
          <input
            type="text"
            value={areas[activeLineIndex]?.name || ''}
            onChange={(e) => {
              const newName = e.target.value;
              setAreas((prevAreas) =>
                prevAreas.map((area, index) =>
                  index === activeLineIndex ? { ...area, name: newName } : area,
                ),
              );
            }}
            placeholder="Enter area name"
            className="border rounded px-2 py-1 bg-white shadow-md"
          />
        </div>
      </div>
      <div className="flex flex-col absolute top-4 right-4 rounded-lg shadow-lg p-4 bg-white">
        {areas.map((area, index) => (
          <div
            className={`flex px-2 py-1 items-center cursor-pointer ${
              index == activeLineIndex ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            <span
              className="w-full"
              key={index}
              onClick={() => setActiveLineIndex(index)}
            >
              <span className="ml-2 mr-4">{area.name}</span>
            </span>
            <button
              onClick={() => {
                if (lines.length > 1) {
                  setAreas((prevAreas) => {
                    const updatedAreas = [...prevAreas];

                    if (activeLineIndex >= index) {
                      setActiveLineIndex(Math.max(activeLineIndex - 1, 0));
                    }
                    updatedAreas.splice(index, 1);
                    return updatedAreas;
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
            setAreas((prevAreas) => [
              ...prevAreas,
              {
                joined: false,
                points: [],
                name: '',
                style: 'mat',
                color: `#${Math.floor(Math.random() * 16777215).toString(
                  16,
                )}5e`,
              },
            ]);
            setActiveLineIndex(areas.length);
          }}
        >
          New Area
        </button>
      </div>
    </div>
  );
}
