import requests
from PIL import Image
from io import BytesIO
import os

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
                'X-Api-Key': 'ZUho38RByEv2TDmXciiqAqW9'
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
            print('Background removal and greyscale conversion completed successfully.')
            return(grey_scale_output_path)

    except Exception as error:
        print('Failed to process image:', error)

if __name__ == '__main__':
    remove_background_and_convert_to_greyscale()
