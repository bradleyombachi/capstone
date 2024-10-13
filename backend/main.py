from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import router as api_router
import uvicorn
from fastapi.lifespan import Lifespan

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_model():
    """Helper function to load the model."""
    global model
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')
        model = tf.keras.models.load_model(model_dir)
        print("Model loaded successfully on startup.")
    except Exception as e:
        print(f"Error loading model during startup: {str(e)}")

# Lifespan context to handle startup and shutdown tasks
app = FastAPI(lifespan=Lifespan(on_startup=load_model))


app.include_router(api_router)

# run the file manually to test on ios
if __name__ == "__main__":
    uvicorn.run(app, host="192.168.254.61", port=8000)