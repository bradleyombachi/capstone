import requests
from PIL import Image
from io import BytesIO

def remove_background_and_convert_to_greyscale():
    input_path = './assets/legopic.jpg'
    output_path = 'no-bg.png'
    grey_scale_output_path = './output/greylego.jpg'

    try:
        # Prepare the form data for the request
        with open(input_path, 'rb') as file:
            files = {
                'image_file': (input_path, file),
                'size': (None, 'auto')
            }
            headers = {
                'X-Api-Key': 'MEWWaAWxEuXpBJtLBAQBxzNu'
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
            grey_image.save(grey_scale_output_path)
            print('Background removal and greyscale conversion completed successfully.')

    except Exception as error:
        print('Failed to process image:', error)

if __name__ == '__main__':
    remove_background_and_convert_to_greyscale()
