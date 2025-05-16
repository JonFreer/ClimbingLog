
import datetime
from .. import schemas
from ..db import get_db
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile,Form
from fastapi.responses import FileResponse, Response
from ..users import User, current_active_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
import subprocess
from pathlib import Path
import asyncio
from ..models import Videos
from typing import Annotated, List

router = APIRouter()
async def process_video(video_path: Path, processed_video_path: Path,id: uuid.UUID, db: AsyncSession):
    """Asynchronously process the video using ffmpeg."""
    print(f"Processing video: {video_path} to {processed_video_path}")
    try:
        process = await asyncio.create_subprocess_exec(
                    "ffmpeg",
                    "-i", str(video_path),
                    "-vf", "scale=-2:720",  # Scale height to 720 while maintaining aspect ratio
                    "-c:v", "libx264",  # Convert to AV1 codec
                    "-crf", "26",
                    str(processed_video_path),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing video file: {stderr.decode()}"
            )
        
        # Generate a thumbnail
        thumbnail_path = "./videos/thumb/" + str(id) + ".jpg"
        thumbnail_process = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-i", str(video_path),
            "-ss", "00:00:01",  # Capture a frame at 1 second
            "-vframes", "1",  # Extract only one frame
            str(thumbnail_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        thumbnail_stdout, thumbnail_stderr = await thumbnail_process.communicate()

        if thumbnail_process.returncode != 0:
            print(f"Error generating thumbnail: {thumbnail_stderr.decode()}")
        else:
            print(f"Thumbnail saved to: {thumbnail_path}")

        # Delete the original video after processing
        try:
            video_path.unlink()
            print(f"Deleted original video: {video_path}")
        except Exception as delete_error:
            print(f"Failed to delete original video: {delete_error}")

        # Update the database to mark the video as processed
        
        stmt = select(Videos).where(Videos.id == id)
        result = await db.execute(stmt)
        video = result.scalars().first()
        if video:
            video.processed = True
            db.add(video)
            await db.commit()
            print(f"Video {id} marked as processed in the database.")
        else:
            print(f"Video {id} not found in the database.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/video", response_model=None, tags=["video"])
async def update_video(
    route: Annotated[uuid.UUID, Form(...)],
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    if user.is_verified == False:
        raise HTTPException(status_code=403, detail="User is not verified")
    
    print(f"Received file: {file.filename}")
    upload_dir = Path("./videos/raw/")
    id = uuid.uuid4()
    video_path = upload_dir / f"{id}.mp4"
    with video_path.open("wb") as buffer:
        buffer.write(await file.read())

    print(f"Saved video to: {video_path}")
    processed_video_path =  f"./videos/processed/{video_path.name}"

    # Schedule the video processing task in the background
    asyncio.create_task(process_video(video_path, processed_video_path,id,db))

    # Add video metadata to the database
    new_video = Videos(
        id=id,
        user=user.id,
        route=route,
        processed=False,
        time=datetime.datetime.now(),
    )

    db.add(new_video)
    await db.commit()
    await db.refresh(new_video)

    # Return a response immediately
    return {"message": "Video processing started", "processed_video": str(new_video.id)}

@router.get(
    "/route_videos/{route_id}", response_model=List[schemas.Video], tags=["video"]
)
async def get_route_videos(
    response: Response,
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    # Fetch the video metadata from the database
    stmt = select(Videos, User.username, User.has_profile_photo).join(User).where(Videos.route == route_id)
    result = await db.execute(stmt)
    videos = [
        {
            "id": video.id,
            "user": video.user,
            "route": video.route,
            "processed": video.processed,
            "time": video.time,
            "username": user_username,
            "has_profile_photo": user_has_profile_photo,
        }
        for video, user_username, user_has_profile_photo in result.all()
    ]

    if not videos:
        return []

    # Return the list of videos
    return videos

@router.get("/videos/", response_model=List[schemas.Video], tags=["video"])
async def get_videos(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Fetch the video metadata from the database
    stmt = select(Videos, User.username, User.has_profile_photo).join(User)
    result = await db.execute(stmt)
    videos = [
        {
            "id": video.id,
            "user": video.user,
            "route": video.route,
            "processed": video.processed,
            "time": video.time,
            "username": user_username,
            "has_profile_photo": user_has_profile_photo,
        }
        for video, user_username, user_has_profile_photo in result.all()
    ]

    if not videos:
        return []

    # Return the list of videos
    return videos

@router.get("/video_thumbnail/{video_id}", tags=["video"])
async def get_video_thumbnail(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    # Fetch the video metadata from the database
    stmt = select(Videos).where(Videos.id == video_id)
    result = await db.execute(stmt)
    video = result.scalars().first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    thumbnail_path = Path(f"./videos/thumb/{video_id}.jpg")
    if not thumbnail_path.exists():
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    # Return the thumbnail as a file response
    return FileResponse(thumbnail_path, media_type="image/jpeg")

@router.get("/video/{video_id}", tags=["video"])
async def get_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    # Fetch the video metadata from the database
    stmt = select(Videos).where(Videos.id == video_id)
    result = await db.execute(stmt)
    video = result.scalars().first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_path = Path(f"./videos/processed/{video_id}.mp4")
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    # Return the video as a file response
    return FileResponse(video_path, media_type="video/mp4")

@router.delete("/video/{video_id}", tags=["video"])
async def delete_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_active_user),
):
    # Fetch the video metadata from the database
    stmt = select(Videos).where(Videos.id == video_id)
    result = await db.execute(stmt)
    video = result.scalars().first()

    if video.user != user.id and user.is_superuser == False:
        raise HTTPException(status_code=403, detail="User is not authorized to delete this video")

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete the video from the database
    await db.delete(video)
    await db.commit()

    # Delete the video file
    video_path = Path(f"./videos/processed/{video_id}.mp4")
    if video_path.exists():
        video_path.unlink()
        print(f"Deleted video file: {video_path}")

    thumbnail_path = Path(f"./videos/thumb/{video_id}.jpg")
    if thumbnail_path.exists():
        thumbnail_path.unlink()
        print(f"Deleted thumbnail file: {thumbnail_path}")

    return {"message": "Video deleted successfully"}