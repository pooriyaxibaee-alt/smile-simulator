import os
os.environ["OPENCV_LOG_LEVEL"] = "ERROR"  # فقط ارورها رو نشون بده
import cv2
import mediapipe as mp
import sys
import numpy as np
import os

# تنظیم MediaPipe برای تشخیص صورت
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    min_detection_confidence=0.5
)

def detect_smile_landmarks(image_path, output_path=None):
    # خواندن تصویر
    image = cv2.imread(image_path)
    if image is None:
        return f"Error: Could not load image at {image_path}"

    # تبدیل به RGB برای MediaPipe
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # تشخیص لندمارک‌ها
    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return f"Error: No face detected in {image_path}"

    landmarks = results.multi_face_landmarks[0].landmark
    h, w = image.shape[:2]

    # 🔹 فقط ۴ لندمارک: گوشه‌ها و وسط لب بالا و پایین
    indices = [61, 291, 13, 14]  # Left corner, Right corner, Upper lip, Lower lip
    mouth_coords = [(int(landmarks[i].x * w), int(landmarks[i].y * h)) for i in indices]

    # رسم لندمارک‌ها روی تصویر
    for (x, y) in mouth_coords:
        cv2.circle(image, (x, y), 5, (0, 255, 0), -1)

    if output_path:
        cv2.imwrite(output_path, image)

    return f"Mouth landmarks (4 points) in {os.path.basename(image_path)}: {mouth_coords}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_image.py <image1> <image2> ...")
        sys.exit(1)

    for img_path in sys.argv[1:]:
        out_path = img_path.replace("uploads", "outputs")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        print(detect_smile_landmarks(img_path, out_path))