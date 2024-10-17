import time
import asyncio
import websockets
import json
import os
import base64

# WebSocket endpoint to test
uri = "ws://192.168.254.61:8000/ws"  # Replace with the correct server address if needed

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# path for the mock image
mock_dir = os.path.join(script_dir, '..', 'mock_data')


# Mock data representing the image (you can replace this with actual data)
image_path = os.path.join(mock_dir, "single_lego_3.jpg")

# Function to convert image to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Convert the image to base64
image_data = image_to_base64(image_path)


async def single_image_test(image_data, user_id=1):
    start_time = time.time()
    print(f"[User {user_id}] Test started at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")

    async with websockets.connect(uri) as websocket:
        try:
            # Send the mock image data
            await websocket.send(image_data)
            print(f"[User {user_id}] Sent image data to server")

            # Wait for the server's response
            response = await websocket.recv()
            print(f"[User {user_id}] Received response: {response}")

            # Measure the total response time
            total_time = time.time() - start_time
            print(f"[User {user_id}] Response Time: {total_time:.2f} seconds at {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time + total_time))}")

            # Parse the response to check if it's correct
            response_data = json.loads(response)
            if "contours" in response_data and "brickGuess" in response_data:
                print(f"[User {user_id}] Contours and brickGuess received successfully")
            else:
                print(f"[User {user_id}] Unexpected response format")

        except websockets.exceptions.ConnectionClosed as e:
            print(f"[User {user_id}] WebSocket connection closed: {e}")


# Run the test
asyncio.get_event_loop().run_until_complete(single_image_test(image_data=image_data))
