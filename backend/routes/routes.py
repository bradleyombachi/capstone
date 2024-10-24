from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from services import process_frame
import os
import base64
import tensorflow as tf
import math


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

KNOWN_COLORS = {
    'black': (0, 0, 0),
    'white': (255, 255, 255),
    
    # Shades of Red
    'red': (255, 0, 0),
    'light_red': (255, 102, 102),
    'dark_red': (139, 0, 0),

    # Shades of Green
    'green': (0, 255, 0),
    'light_green': (144, 238, 144),
    'dark_green': (0, 100, 0),

    # Shades of Blue
    'blue': (0, 0, 255),
    'light_blue': (173, 216, 230),
    'dark_blue': (0, 0, 139),

    # Shades of Yellow
    'yellow': (255, 255, 0),
    'light_yellow': (255, 255, 102),
    'dark_yellow': (204, 204, 0),

    # Shades of Cyan
    'cyan': (0, 255, 255),
    'light_cyan': (224, 255, 255),
    'dark_cyan': (0, 139, 139),

    # Shades of Magenta
    'magenta': (255, 0, 255),
    'light_magenta': (255, 102, 255),
    'dark_magenta': (139, 0, 139),

    # # Shades of Gray
    # 'light_gray': (211, 211, 211),
    # 'gray': (128, 128, 128),
    # 'dark_gray': (64, 64, 64),

    # Shades of Orange
    'orange': (255, 165, 0),
    'light_orange': (255, 200, 102),
    'dark_orange': (255, 140, 0),

    # Shades of Purple
    'purple': (128, 0, 128),
    'light_purple': (216, 191, 216),
    'dark_purple': (75, 0, 130)
}

def euclidean_distance(color1, color2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(color1, color2)))

def closest_color(input_color):
    closest_name = None
    min_distance = float('inf')
    
    for color_name, known_color in KNOWN_COLORS.items():
        distance = euclidean_distance(input_color, known_color)
        if distance < min_distance:
            min_distance = distance
            closest_name = color_name
    
    return closest_name
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
                valid_contours,brick,average_color = process_frame(data, model)
                print(f"Average color RGB values: {average_color}")  # Debugging output

                average_color = closest_color(average_color)
                response = {
                    "contours": valid_contours,
                    "brickGuess" : brick,
                    "color" : average_color
                }
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