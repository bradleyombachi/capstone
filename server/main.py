from fastapi import FastAPI, UploadFile
import os
import shutil




app = FastAPI()


upload_directory = "./uploaded_images"

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/identify")
async def create_upload_file(file: UploadFile):
    file_path = os.path.join(upload_directory, file.filename)
    
    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": file.filename, "path": file_path}