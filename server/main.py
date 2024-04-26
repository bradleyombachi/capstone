from fastapi import FastAPI, UploadFile
import os
import shutil




app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/identify")
async def identify(file: UploadFile):
    file_location = f"uploaded_images/{file.filename}"

    os.makedirs(os.path.dirname(file_location), exist_ok=True)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "Image uploaded successfully",
    }