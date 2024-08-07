from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import base64

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
