from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import router as api_router
import uvicorn
import tensorflow as tf
import os
from contextlib import asynccontextmanager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = None 

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Helper function to load the model."""
    global model
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')
        model = tf.keras.models.load_model(model_dir)
        print("Model loaded successfully on startup.")
        yield
    except Exception as e:
        print(f"Error loading model during startup: {str(e)}")
        yield
    finally:
        # cleanup resources
        model = None
        print("Model unloaded and shutdown")

app = FastAPI(lifespan=lifespan)

app.include_router(api_router)

# run the file manually to test on ios
if __name__ == "__main__":
    uvicorn.run(app, host="10.125.179.123", port=8000)