from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from typing import Optional
import os
import uuid

# ---------------- CONFIG ----------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load your trained YOLO model once at startup
# Make sure best.pt is in the same folder as this file
print("🔄 Loading model best.pt ...")
model = YOLO("best.pt")
print("✅ Model loaded successfully")

# ---------------- APP ----------------
app = FastAPI(
    title="Road Damage AI API",
    description="API to analyze road images using YOLOv8 best.pt model",
)

# Allow frontend (React) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # later you can restrict to http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HELPERS ----------------
def compute_severity(num_detections: int) -> str:
    if num_detections >= 5:
        return "High"
    elif num_detections >= 2:
        return "Medium"
    elif num_detections == 1:
        return "Low"
    else:
        return "None"

# ---------------- ROUTES ----------------
@app.get("/ping")
def ping():
    """
    Simple health check for testing if server is alive.
    """
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze_road_image(
    name: str = Form(...),
    location: str = Form(...),
    description: Optional[str] = Form(""),
    source: str = Form("upload"),        # 'upload' or 'camera'
    file: UploadFile = File(...)
):
    """
    Analyze a road image using YOLOv8 model.
    """
    # 1) Save uploaded file to disk
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    # 2) Run YOLO only if it's an image
    num_detections = 0
    classes = []
    try:
        if ext.lower() in [".jpg", ".jpeg", ".png"]:
            results = model(filepath)
            boxes = results[0].boxes

            num_detections = len(boxes)

            for box in boxes:
                cls_id = int(box.cls.item())
                cls_name = results[0].names[cls_id]
                classes.append(cls_name)
        else:
            num_detections = 0

    except Exception as e:
        print("❌ Error running model:", e)
        return {
            "success": False,
            "error": str(e),
        }

    # 3) Compute severity based on detections
    severity = compute_severity(num_detections)

    # 4) Build response (later you will also save this to DB)
    response = {
        "success": True,
        "report": {
            "name": name,
            "location": location,
            "description": description,
            "source": source,
            "filePath": filepath,
            "detections": num_detections,
            "classes": classes,
            "severity": severity,
        },
    }

    return response
 