from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from services import process_frame
import os
import base64
import tensorflow as tf
import math
import json

router = APIRouter()


@router.get("/")
async def test():
    return {"brickName": "Damn"}

class ImagePayload(BaseModel):
    filename: str
    data: str

UPLOAD_DIR = "uploads"

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post('/upload')
async def upload_file(payload: ImagePayload):
    try:
        print(f"Received upload request for file: {payload.filename}")
        # Decode the base64 data
        header, encoded = payload.data.split(",", 1)
        file_data = base64.b64decode(encoded)

        # Define the file path
        file_path = os.path.join(UPLOAD_DIR, payload.filename)

        # Write the file to the uploads directory
        with open(file_path, "wb") as file:
            file.write(file_data)

        print(f"Received file: {payload.filename}")
        print(f"Saved to: {file_path}")
        
        print(f"File saved successfully: {file_path}")
        return {"message": f"File {payload.filename} received and saved successfully"}

    except Exception as e:
        error_msg = f"Error uploading file: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)



# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the uploads directory
model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')

# construct the path to input dir
input_dir = os.path.join(script_dir, '..', 'input')

# construct the full path to the bg image 
bg_image_name = "background_backlit_B.jpg"
bg_image_path = os.path.join(input_dir, bg_image_name)


@router.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Log whether the connection is using wss or ws
    protocol = 'wss' if websocket.url.scheme == 'wss' else 'ws'
    print(f"WebSocket connection established using {protocol}://")

    # load the model on booting 
    try: 
        model = tf.keras.models.load_model(model_dir)
        print("Model loaded sucessfuly.")
    except Exception as e:
        print("Failed to load the model {e}")

    try:
        while True:
            try:
                data = await websocket.receive_text()
                print("Received data from client")
                response = process_frame(data, model)

                await websocket.send_json(response)
                print("Sent contours to client")
            except WebSocketDisconnect:
                print("Client disconnected")
                break
            except Exception as e:
                print(f"Error processing frame: {str(e)}")
                await websocket.send_json({"error": str(e)})
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
    finally:
        await websocket.close()
        print("WebSocket connection closed")