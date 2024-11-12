import time
import asyncio
import websockets
import json
import os
from image_upload_ws_test import image_to_base64, uri  # Adjust the import based on your module structure

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path for the mock image
mock_dir = os.path.join(script_dir, '..', 'mock_data')

# Mock data representing the image
image_path = os.path.join(mock_dir, "single_lego_3.jpg")

# Convert the image to base64
image_data = image_to_base64(image_path)

async def endurance_test(duration):
    start_time = time.time()
    print(f"Endurance test started at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")

    total_requests = 0
    successful_responses = 0

    while time.time() - start_time < duration:
        async with websockets.connect(uri) as websocket:
            try:
                # Send the mock image data
                await websocket.send(image_data)
                print("Sent image data to server")

                # Wait for the server's response
                response = await websocket.recv()
                print(f"Received response: {response}")

                # Measure the total response time
                total_time = time.time() - start_time
                print(f"Response Time: {total_time:.2f} seconds at {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time + total_time))}")

                # Parse the response to check if it's correct
                response_data = json.loads(response)
                total_requests += 1  # Increment total requests
                if "contours" in response_data and "brickGuess" in response_data:
                    print("Contours and brickGuess received successfully")
                    successful_responses += 1  # Increment successful responses
                else:
                    print("Unexpected response format")

                # Wait before sending the next message (adjust as needed)
                await asyncio.sleep(1)  # Adjust the interval as necessary

            except websockets.exceptions.ConnectionClosed as e:
                print(f"WebSocket connection closed: {e}")
                break

    # Test summary
    print("\n--- Test Summary ---")
    print(f"Total Requests Sent: {total_requests}")
    print(f"Successful Responses: {successful_responses}")
    if successful_responses == total_requests:
        print("All tests passed successfully!")
    else:
        print("Some tests failed.")

# Run the endurance test
if __name__ == "__main__":
    duration = 600  # Run the test for 1 hour (3600 seconds)
    print(f"Starting endurance test for {duration} seconds...")
    asyncio.run(endurance_test(duration))
