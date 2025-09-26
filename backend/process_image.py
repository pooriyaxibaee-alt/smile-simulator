import cv2
import mediapipe as mp
import sys
import os
import numpy as np
import google.generativeai as genai

# ✅ تنظیم Gemini با API Key مستقیم
def setup_gemini():
    api_key = "AIzaSyB2LCLHVT5nDqcAQVj47ulfVGUeYx9Vt9A"  # 👈 کلید واقعی‌ت رو اینجا بذار
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")

# تنظیم MediaPipe برای تشخیص صورت
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    min_detection_confidence=0.5
)

def detect_smile_landmarks(image_path, label):
    abs_path = os.path.abspath(image_path)
    print(f"Absolute path: {abs_path}")
    print(f"File exists: {os.path.exists(abs_path)}")
    if os.path.exists(abs_path):
        print(f"File size: {os.path.getsize(abs_path)} bytes")

    image = cv2.imread(image_path)
    if image is None:
        return f"Error: Could not load image at {abs_path}"

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return f"Error: No face detected in {abs_path}"

    landmarks = results.multi_face_landmarks[0].landmark

    # چهار لندمارک کلیدی: گوشه‌ها و بالا/پایین لب
    selected_indices = [61, 291, 13, 14]
    height, width = image.shape[:2]
    coords = [(int(landmarks[i].x * width), int(landmarks[i].y * height)) for i in selected_indices]

    return f"Landmarks: {label} {coords}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_image.py <reference_image> <patient_image>")
        sys.exit(1)

    ref_image, patient_image = sys.argv[1], sys.argv[2]
    ref_result = detect_smile_landmarks(ref_image, "Ref")
    patient_result = detect_smile_landmarks(patient_image, "Patient")

    print(ref_result)
    print(patient_result)

    # ارسال به Gemini برای تحلیل
    model = setup_gemini()
    prompt = f"""
    Analyze the smile differences between reference and patient images based on these landmarks:
    {ref_result}
    {patient_result}
    """
    try:
        response = model.generate_content(prompt)
        if response and response.candidates:
            print("Edited:", response.text.strip())
        else:
            print("Edited: Gemini did not return a valid response.")
    except Exception as e:
        print("Edited: Gemini error:", str(e))