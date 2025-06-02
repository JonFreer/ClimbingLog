import { Line, Transform } from './types';

export function getCoordinates(
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  transform: Transform,
) {
  const rect = canvas.getBoundingClientRect();
  const x =
    (event.clientX - rect.left - transform.translateX) / transform.scale;
  const y = (event.clientY - rect.top - transform.translateY) / transform.scale;

  return { x, y };
}

export function drawPoints(line: Line, ctx: CanvasRenderingContext2D) {
  line.points.forEach((point, index) => {
    if (index === 0) {
      ctx.fillStyle = '#ff00005e';
    } else if (index === line.points.length - 1) {
      ctx.fillStyle = '#00ff005e';
    } else {
      ctx.fillStyle = '#0000ff5e';
    }
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

export function drawLine(line: Line, ctx: CanvasRenderingContext2D) {
  if (line.style == 'mat') {
    ctx.strokeStyle = '#9e9e9e';
  } else if (line.style == 'wall') {
    ctx.strokeStyle = '#000000';
  }

  let startX = null,
    startY = null;
  let endX = null,
    endY = null;

  const coordinates = line.points.slice();

  if (!line.joined) {
    // If the line is joined, we need to close the path by connecting the last point to the first
    if (coordinates.length > 1) {
      coordinates.unshift(coordinates[0]);
      coordinates.push(coordinates[coordinates.length - 1]);
    }
  } else {
    // If not joined, we can just draw the points as they are
    if (coordinates.length > 3) {
      coordinates.push(coordinates[0]);
      coordinates.push(coordinates[1]);
      coordinates.push(coordinates[2]); // Added to ensure the third point is included
    }
  }

  const curve_ratio = 0.8;
  for (let i = 0; i < coordinates.length - 2; i++) {
    // starting point is 90% towards the next point (point b)
    startX =
      coordinates[i].x * (1 - curve_ratio) + coordinates[i + 1].x * curve_ratio;
    startY =
      coordinates[i].y * (1 - curve_ratio) + coordinates[i + 1].y * curve_ratio;

    // control point is the next point in the array
    const controlX = coordinates[i + 1].x; // control point x
    const controlY = coordinates[i + 1].y; // control point y

    if (endX != null && endY != null) {
      // draw a straigntline between startX and endX
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // end point is halfway between the two next points
    endX =
      coordinates[i + 1].x * curve_ratio +
      coordinates[i + 2].x * (1 - curve_ratio);
    endY =
      coordinates[i + 1].y * curve_ratio +
      coordinates[i + 2].y * (1 - curve_ratio);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();
  }
}
