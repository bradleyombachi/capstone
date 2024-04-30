from fastapi import FastAPI, UploadFile, HTTPException
import os
import shutil
from imageProcessing import *
from pydantic import BaseModel
import base64
import logging
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans


logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

class ImageData(BaseModel):
    filename: str
    data: str  # This will hold the base64 encoded file data

def find_dominant_color(image_path, num_clusters=1):
    # Load image
    image = Image.open(image_path)
    # Resize image to speed up processing
    image = image.resize((100, 100))
    # Convert image to numpy array
    image_np = np.array(image)
    # Reshape array to be a list of RGB colors
    pixels = image_np.reshape((image_np.shape[0] * image_np.shape[1], 3))
    
    # Use k-means clustering to find the most common color
    kmeans = KMeans(n_clusters=num_clusters)
    kmeans.fit(pixels)
    # Get the RGB values of the dominant color
    dominant_color = kmeans.cluster_centers_[0].astype(int)
    
    return '#{:02x}{:02x}{:02x}'.format(dominant_color[0], dominant_color[1], dominant_color[2])


upload_directory = "./uploaded_images"

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/identify")
async def create_upload_file(image_data: ImageData):
    file_path = os.path.join(upload_directory, image_data.filename)
    
    # Check if data URI scheme is present and strip it
    header, _, data = image_data.data.partition(",")
    if header.startswith('data') and ';' in header:
        data = data  # use data part after comma if header is present
    else:
        data = image_data.data  # use raw data if no header is present

    # Decode the base64 string
    try:
        file_bytes = base64.b64decode(data, validate=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid base64 string: " + str(e))


    # Save the decoded bytes to a file
    with open(file_path, "wb") as file:
        file.write(file_bytes)
      
    filename_without_extension = os.path.splitext(os.path.basename(file_path))[0]

    output_path = os.path.join("output", f"{filename_without_extension}_no-bg.png")
    color = find_dominant_color(output_path)
    greyscale = remove_background_and_convert_to_greyscale(file_path)
    # Here you could continue processing the image as needed

    return {"filename": image_data.filename, "path": file_path, "color": color}
