from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import os
import uuid
import cv2

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------ Model + folders ------------
MODEL_PATH = "best.pt"  # keep this in SAME folder as main.py
OUTPUT_DIR = "static"
BASE_URL = "http://localhost:8000"

os.makedirs(OUTPUT_DIR, exist_ok=True)

try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print("Error loading model:", e)
    raise

# Static to serve images/videos
app.mount("/static", StaticFiles(directory=OUTPUT_DIR), name="static")


def classify_severity(num_dets: int) -> str:
    if num_dets == 0:
        return "low"
    if num_dets < 10:
        return "medium"
    return "high"


# ------------ IMAGE ENDPOINT ------------
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if file.content_type.split("/")[0] != "image":
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    # Save original upload
    ext = os.path.splitext(file.filename)[1]
    temp_name = f"input_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(OUTPUT_DIR, temp_name)

    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Run YOLO
    results = model(temp_path)

    plotted_path = os.path.join(OUTPUT_DIR, f"processed_{uuid.uuid4().hex}.jpg")
    for r in results:
        im = r.plot()
        cv2.imwrite(plotted_path, im)

    last_result = results[-1]
    num_dets = len(last_result.boxes)

    detections = []
    for box in last_result.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        class_name = model.names.get(cls_id, str(cls_id))
        detections.append(
            {
                "class_id": cls_id,
                "class_name": class_name,
                "confidence": round(conf, 3),
            }
        )

    severity = classify_severity(num_dets)
    summary = f"Detected {num_dets} road issue(s)."

    processed_image_url = f"{BASE_URL}/static/{os.path.basename(plotted_path)}"

    return {
        "type": "image",
        "processed_image_url": processed_image_url,
        "detections": detections,
        "severity": severity,
        "summary": summary,
    }


# ------------ VIDEO ENDPOINT ------------
@app.post("/detect-video")
async def detect_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Please upload a video file.")

    ext = os.path.splitext(file.filename)[1]
    temp_name = f"video_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(OUTPUT_DIR, temp_name)

    with open(temp_path, "wb") as f:
        f.write(await file.read())

    cap = cv2.VideoCapture(temp_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Could not read video file.")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out_name = f"processed_{uuid.uuid4().hex}.mp4"
    out_path = os.path.join(OUTPUT_DIR, out_name)

    fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(out_path, fourcc, fps, (w, h))

    total_frames = 0
    total_detections = 0
    frames_with_detections = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        total_frames += 1
        results = model(source=frame, verbose=False)
        r = results[0]

        num_dets = len(r.boxes)
        total_detections += num_dets
        if num_dets > 0:
            frames_with_detections += 1

        plotted = r.plot()
        out.write(plotted)

    cap.release()
    out.release()

    severity = classify_severity(total_detections)
    summary = (
        f"Processed {total_frames} frames. "
        f"Total detections: {total_detections}. "
        f"Frames with detections: {frames_with_detections}."
    )

    processed_video_url = f"{BASE_URL}/static/{os.path.basename(out_path)}"

    return {
        "type": "video",
        "processed_video_url": processed_video_url,
        "total_frames": total_frames,
        "total_detections": total_detections,
        "frames_with_detections": frames_with_detections,
        "severity": severity,
        "summary": summary,
    }
