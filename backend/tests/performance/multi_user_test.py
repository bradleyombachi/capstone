import os
import asyncio
from image_upload_ws_test import single_image_test, image_to_base64

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path for the mock image
mock_dir = os.path.join(script_dir, '..', 'mock_data')

# Mock data representing the image (you can replace this with actual data)
image_path = os.path.join(mock_dir, "single_lego_3.jpg")

# Convert the image to base64
image_data = image_to_base64(image_path)


async def main():
    users = 5  # Number of users to simulate
    tasks = []

    # Create tasks for each user
    for user_id in range(1, users + 1):
        tasks.append(single_image_test(image_data, user_id))

    # Run all tasks concurrently
    await asyncio.gather(*tasks)

# Run the test
if __name__ == "__main__":
    asyncio.run(main())
