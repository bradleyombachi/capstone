import os
import asyncio
import websockets
import json
import base64

# WebSocket endpoint to test
uri = "ws://192.168.254.61:8000/ws"  # Replace with the correct server address if needed

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path for the mock image
mock_dir = os.path.join(script_dir, '..', 'mock_data')

# Mock data representing the image (you can replace this with actual data)
image_path = os.path.join(mock_dir, "single_lego_3.jpg")

# Function to convert image to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Convert the image to base64
image_data = image_to_base64(image_path)

async def stress_test(user_id):
    async with websockets.connect(uri) as websocket:
        try:
            await websocket.send(image_data)
            response = await websocket.recv()
            response_data = json.loads(response)

            # Log successful response
            print(f"[User {user_id}] Received response: {response_data}")

        except websockets.exceptions.ConnectionClosed as e:
            print(f"[User {user_id}] WebSocket connection closed: {e}")

async def main(user_count):
    tasks = []

    # Create multiple tasks for each simulated user
    for user_id in range(1, user_count + 1):
        tasks.append(stress_test(user_id))

    # Run all tasks concurrently
    await asyncio.gather(*tasks)

# Number of users to simulate for the stress test
if __name__ == "__main__":
    user_count = 5 
    print(f"Starting stress test with {user_count} users...")
    asyncio.run(main(user_count))
