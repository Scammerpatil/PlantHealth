import os
import sys
import cv2
import numpy as np
import locale
import json
import tensorflow as tf
from tensorflow.keras.preprocessing.image import img_to_array, load_img
sys.stdout.reconfigure(encoding='utf-8')
os.environ["PYTHONIOENCODING"] = "utf-8"
myLocale=locale.setlocale(category=locale.LC_ALL, locale="en_GB.UTF-8")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

MODEL_PATH = 'python/potatoes.keras'
MODEL = tf.keras.models.load_model(MODEL_PATH)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

def read_image(image_path):
    """ Reads and decodes an image using OpenCV. """
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Unable to read the image file.")
        sys.exit(1)
    return image

def detect_leaf(image):
    """ Checks if the image contains a leaf using color thresholding. """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_green = np.array([25, 40, 40], dtype=np.uint8)
    upper_green = np.array([90, 255, 255], dtype=np.uint8)

    mask = cv2.inRange(hsv, lower_green, upper_green)
    leaf_pixels = np.count_nonzero(mask)

    return leaf_pixels > (0.1 * image.size)
def predict_disease(img_path , target_size=(300, 300)):    
    """ Performs inference using TensorFlow model. """
    img = load_img(img_path, target_size=target_size)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)
    prediction = MODEL.predict(img_array)
    predicted_class = CLASS_NAMES[np.argmax(prediction)]
    confidence = float(prediction[0][np.argmax(prediction)])
    return predicted_class, confidence

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No image file provided.")
        sys.exit(1)

    img_path = sys.argv[1]
    if not os.path.isfile(img_path):
        print(f"Error: File '{img_path}' not found.")
        sys.exit(1)
    image = read_image(img_path)
    if detect_leaf(image):
        disease, confidence = predict_disease(img_path)
        print(json.dumps({"class": disease, "confidence": confidence}))
    else:
        print("No leaf detected in the image.")
