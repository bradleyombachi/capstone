import cv2
import os
import numpy as np
import base64
from rembg import remove
from .lego_guesser import predictor
import math

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to necessary directories
model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')
uploads_dir = os.path.join(script_dir, '..', 'uploads')
input_dir = os.path.join(script_dir, '..', 'input')
output_dir = os.path.join(script_dir, '..', 'output')



KNOWN_COLORS = {
    'Black': (0, 0, 0),
    'White': (255, 255, 255),
    
    # Shades of Red
    'Red': (255, 0, 0),
    'Light Red': (255, 102, 102),
    'Dark Red': (139, 0, 0),

    # Shades of Green
    'Green': (0, 255, 0),
    'Light Green': (144, 238, 144),
    'Dark Green': (0, 100, 0),

    # Shades of Blue
    'Blue': (0, 0, 255),
    'Light Blue': (173, 216, 230),
    'Dark Blue': (0, 0, 139),

    # Shades of Yellow
    'Yellow': (255, 255, 0),
    'Light Yellow': (255, 255, 102),
    'Dark Yellow': (204, 204, 0),

    # Shades of Cyan
    'Cyan': (0, 255, 255),
    'Light Cyan': (224, 255, 255),
    'Dark Cyan': (0, 139, 139),

    # Shades of Magenta
    'Magenta': (255, 0, 255),
    'Light Magenta': (255, 102, 255),
    'Dark Magenta': (139, 0, 139),

    # Shades of Orange
    'Orange': (255, 165, 0),
    'Light Orange': (255, 200, 102),
    'Dark Orange': (255, 140, 0),

    # Shades of Purple
    'Purple': (128, 0, 128),
    'Light Purple': (216, 191, 216),
    'Dark Purple': (75, 0, 130)
}

def euclidean_distance(color1, color2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(color1, color2)))

def closest_color(input_color):
    closest_name = None
    min_distance = float('inf')
    
    for color_name, known_color in KNOWN_COLORS.items():
        distance = euclidean_distance(input_color, known_color)
        if distance < min_distance:
            min_distance = distance
            closest_name = color_name
    
    return closest_name


# Function to calculate the average of pixels darker than 50
def average_dark_color(image):
    dark_pixels = image[np.all(image < [50, 50, 50], axis=-1)]
    if dark_pixels.size == 0:
        return [25, 25, 25]
    return np.mean(dark_pixels, axis=0)

# Remove the background and return the image in OpenCV format
def remove_background(input_data):
    output_path = os.path.join(output_dir,'output.jpg')
    # Ensure input_data is bytes
    if isinstance(input_data, str):
        input_data = base64.b64decode(input_data)
    
    result = remove(input_data, force_return_bytes=True)  # Force return bytes

    # Convert byte string to a NumPy array and decode as an image
    nparr = np.frombuffer(result, np.uint8)
    image_no_bg = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)  # Supports transparency if PNG
    
    # Check if the image was properly decoded
    if image_no_bg is None:
        raise ValueError("Failed to decode the image after background removal.")
    
    #cv2.imwrite(output_path, image_no_bg)

    
    image_no_bg_bgr = cv2.cvtColor(image_no_bg, cv2.COLOR_BGRA2BGR)

    # Save the output image
    #cv2.imwrite(output_path, image_no_bg_bgr)

    return image_no_bg_bgr

# Process the image and get contours and predictions
def process_frame(image_data, model):
    # Decode base64-encoded image
    contour_list = []
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    image_input = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    response = {"blocks": [], "full_contours": []}

    try:
        # Process image
        image_no_bg = remove_background(image_data)
        image_gray = cv2.cvtColor(image_no_bg, cv2.COLOR_BGR2GRAY)
        blurred_gray = cv2.GaussianBlur(image_gray, (5, 5), 0)
        _, image_threshold = cv2.threshold(blurred_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(image_threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Process each contour
        height, width, _ = image_no_bg.shape
        for i, contour in enumerate(contours):
            block = {}
            x, y, w, h = cv2.boundingRect(contour)
            contour_area = cv2.contourArea(contour)
            if contour_area > 1300:
                norm_x = x / width
                norm_y = y / height
                norm_w = w / width
                norm_h = h / height
                cropped_image = image_no_bg[y:y+h, x:x+w]
                image_rgb = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB)
                mask = cv2.inRange(cropped_image, np.array([1, 1, 1]), np.array([255, 255, 255]))

                # Get average color and predict label
                avg_color = cv2.mean(image_rgb, mask=mask)[:3]
                closest_color_name = closest_color(avg_color)
                block["average_color"] = closest_color_name
                position = [ norm_x, norm_y, norm_w, norm_h]
                block["position"] = [ norm_x, norm_y, norm_w, norm_h]
                contour_list.append(position)

                try:
                    prediction_label = predictor(cropped_image, model)
                    block["prediction_label"] = prediction_label
                except Exception as e:
                    block["prediction_error"] = str(e)

                response["blocks"].append(block)

        #response["full_contours"] = [[c[0][0] / width, c[0][1] / height] for c in contours]
    except Exception as e:
        response["error"] = str(e)
    response["full_contours"] = contour_list
    return response


# Example usage:
# user_image_name = "318B2DF1-B57C-4033-9547-FBDFF6F2FA9C.jpg"
# user_image_path = os.path.join(uploads_dir, user_image_name)
# valid_contours, prediction = process_frame(user_image_path, model)