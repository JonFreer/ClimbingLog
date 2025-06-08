import { Area, Layout } from '@/types/gym';
import { Line, Transform } from './types';
export function getCoordinates(
  event: React.MouseEvent<HTMLCanvasElement> | React.Touch,
  canvas: HTMLCanvasElement,
  transform: Transform,
) {
  const rect = canvas.getBoundingClientRect();
  const x =
    (event.clientX - rect.left - transform.translateX) / transform.scale;
  const y = (event.clientY - rect.top - transform.translateY) / transform.scale;

  return { x, y };
}

export function getTouchCenter(
  touchList: React.TouchList,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  const centerX = (touchList[0].clientX + touchList[1].clientX) / 2 - rect.left;
  const centerY = (touchList[0].clientY + touchList[1].clientY) / 2 - rect.top;
  return { x: centerX, y: centerY };
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
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

export function drawLine(line: Line, ctx: CanvasRenderingContext2D) {
  const curve_ratio = 0.9;

  if (line.style == 'mat') {
    ctx.strokeStyle = '#e5e5e5';
  } else if (line.style == 'wall') {
    ctx.strokeStyle = '#323232';
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

//string takes the form of lines: and areas:
export function drawLines(layout: Layout, ctx: CanvasRenderingContext2D) {
  ctx.lineWidth = 2.8;

  layout.lines.forEach((line) => {
    if (line.style == 'mat') {
      drawLine(line, ctx);
    }
  });
  layout.lines.forEach((line) => {
    if (line.style == 'wall') {
      drawLine(line, ctx);
    }
  });
}

export function drawText(area: Area, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fff';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const centerX =
    area.points.reduce((sum, point) => sum + point.x, 0) / area.points.length;
  const centerY =
    area.points.reduce((sum, point) => sum + point.y, 0) / area.points.length;
  ctx.font = '8px Arial';
  ctx.strokeStyle = '#0000008e';
  ctx.lineWidth = 1;
  ctx.strokeText(area.name, centerX, centerY);
  ctx.fillText(area.name, centerX, centerY);
}

export const getPinchDistance = (touches: React.TouchList) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};
