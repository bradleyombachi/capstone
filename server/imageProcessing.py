import requests
from PIL import Image
from io import BytesIO
import os
import cv2
import numpy as np

# def crop_to_center_square(image_path):
#     # Load the image
#     img = Image.open(image_path)

#     # Calculate the center square coordinates
#     original_width, original_height = img.size
#     center_x, center_y = original_width // 2, original_height // 2
#     half_square_size = 112  # Half of 255

#     left = center_x - half_square_size
#     top = center_y - half_square_size
#     right = center_x + half_square_size
#     bottom = center_y + half_square_size

#     # Crop the image
#     cropped_img = img.crop((left, top, right, bottom))

#     # Save or return the cropped image
#     cropped_img.save(image_path)
#     print(f'Cropped image saved as {image_path}')
def detect_and_save_overlay_edges(image_path, output_path, low_threshold=100, high_threshold=200, alpha=0.5):
    """
    Detects edges in a grayscale image using the Canny edge detection algorithm, overlays this on the original
    grayscale image, and saves the result to a file.
    """
    # Load the image in grayscale mode
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Check if the image is loaded properly
    if image is None:
        raise FileNotFoundError("The image path specified does not exist or the image could not be loaded.")
    
    # Apply GaussianBlur to reduce noise and improve edge detection
    blurred_image = cv2.GaussianBlur(image, (5, 5), 0)
    
    # Apply Canny edge detector
    edges = cv2.Canny(blurred_image, low_threshold, high_threshold)
    
    # Convert grayscale image back to 3 channels to match edges for overlay
    image_colored = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    
    # Ensure the image dimensions are the same
    if image_colored.shape[:2] != edges_colored.shape[:2]:
        # Resize the edges image to match the original image's size
        edges_colored = cv2.resize(edges_colored, (image_colored.shape[1], image_colored.shape[0]))

    # Overlay the edges on the original image
    overlaid_image = cv2.addWeighted(image_colored, alpha, edges_colored, 1 - alpha, 0)
    
    # Save the overlaid image
    cv2.imwrite(output_path, overlaid_image)





def remove_background_and_convert_to_greyscale(inputPath):  
    input_path = inputPath
    filename_without_extension = os.path.splitext(os.path.basename(input_path))[0]

    output_path = os.path.join("output", f"{filename_without_extension}_no-bg.png")

    # Path for the greyscale image, with "greyscale" in its filename
    grey_scale_filename = f"{filename_without_extension}_greyscale.png"
    grey_scale_output_path = os.path.join("greyscale", grey_scale_filename)

    try:
        # Prepare the form data for the request
        with open(input_path, 'rb') as file:
            files = {
                'image_file': (input_path, file),
                'size': (None, 'auto')
            }
            headers = {
                'X-Api-Key': 'WxtBKr7BjSSTZQdXv5ZiXBMM'
            }

            # Make the request to remove.bg API
            response = requests.post('https://api.remove.bg/v1.0/removebg', files=files, headers=headers, stream=True)

            # Check the response status
            if response.status_code != 200:
                print('Error:', response.status_code, response.text)
                return

            # Write the image with the background removed
            with open(output_path, 'wb') as out_file:
                out_file.write(response.content)

            # Read the image with removed background and convert to greyscale
            image = Image.open(output_path)
            grey_image = image.convert('L')  # Convert to greyscale
            #crop_to_center_square(grey_image)
            grey_image.save(grey_scale_output_path)
            #detect_and_save_overlay_edges(grey_scale_output_path,grey_scale_output_path)
            print('Background removal and greyscale conversion completed successfully.')
            return(grey_scale_output_path)

    except Exception as error:
        print('Failed to process image:', error)

if __name__ == '__main__':
    remove_background_and_convert_to_greyscale()
