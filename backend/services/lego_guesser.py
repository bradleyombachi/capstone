from fastapi import FastAPI, UploadFile, HTTPException
import os
import shutil
from pydantic import BaseModel
import base64
import logging
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import tensorflow as tf
import cv2

script_dir = os.path.dirname(os.path.abspath(__file__))

model_dir = os.path.join(script_dir, '..', 'models/predictLego_2024_sep.keras')

def predictor(image_data, model): 
    labels = {'beam 1m': 0,
        'beam 1x2': 1,
        'brick 1x1': 2,
        'brick 1x2': 3,
        'brick 1x3': 4,
        'brick 1x4': 5,
        'brick 2x2': 6,
        'brick 2x3': 7,
        'brick 2x4': 8,
        'brick bow 1x3': 9,
        'brick bow 1x4': 10,
        'brick corner 1x2x2': 11,
        'brick d16 w cross': 12,
        'bush 2m friction - cross axle': 13,
        'connector peg w knob': 14,
        'cross block fork 2x2': 15,
        'curved brick 2 knobs': 16,
        'flat tile 1x1': 17,
        'flat tile 1x2': 18,
        'flat tile 2x2': 19,
        'flat tile corner 2x2': 20,
        'flat tile round 2x2': 21,
        'lever 2m': 22,
        'lever 3m': 23,
        'peg with friction': 24,
        'plate 1x1': 25,
        'plate 1x2': 26,
        'plate 1x2 with 1 knob': 27,
        'plate 1x3': 28,
        'plate 2 knobs 2x2': 29,
        'plate 2x2': 30,
        'plate 2x3': 31,
        'plate 2x4': 32,
        'plate corner 2x2': 33,
        'roof corner inside tile 2x2': 34,
        'roof corner outside tile 2x2': 35,
        'roof tile 1x1': 36,
        'roof tile 1x2': 37,
        'roof tile 1x3': 38,
        'roof tile 1x4': 39,
        'roof tile 2x2': 40,
        'roof tile 2x3': 41,
        #originally 3x3 hardcoded
        'roof tile inside 2x3': 42,
        'roof tile outside 2x3': 43,
        'round brick 1x1': 44,
        'technic brick 1x2': 45}

    if image_data.ndim == 2:  # If the image is grayscale
        image_data = cv2.cvtColor(image_data, cv2.COLOR_GRAY2RGB)
    
    image_data = cv2.resize(image_data, (224, 224))

    # Convert the image into a numpy array if it's not already
    image_array = np.array(image_data)

    # Reshape and preprocess the image
    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(image_array.reshape((1, 224, 224, 3)))

    # Predict using the model
    prediction = model.predict(image_array)

    predicted_class = np.argmax(prediction, axis=1)[0]

    # Get the class label from your training data
    labels = dict((v, k) for k, v in labels.items())
    predicted_label = labels.get(predicted_class, "Unknown label")

    return predicted_label