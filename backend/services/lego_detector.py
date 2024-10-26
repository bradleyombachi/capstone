import cv2
import os
import numpy as np
import base64
from rembg import remove
import math


KNOWN_COLORS = {
    'White' : (255,255,255),
    'Gray' : (232, 232, 232),
    'Gray' : (228, 232, 232),
    'Gray' : (175, 181, 199),
    'Gray' : (156, 156, 156),
    'Gray' : (107, 90, 90),
    'Gray' : (89, 93, 96),
    'Black' : (33, 33, 33),
    'Red' : (106, 14, 21),
    'Red' : (179, 0, 6),
    'Red' : (255, 85, 0),
    'Red' : (255, 99, 38),
    'Red' : (255, 125, 93),
    'Red' : (255, 129, 114),
    'Red' : (252, 199, 183),
    'Red' : (197, 141, 128),
    'Brown' : (80, 55, 47),
    'Brown' : (115, 84, 66),
    'Brown' : (107, 63, 34),
    'Brown' : (130, 66, 42),
    'Brown' : (153, 102, 62),
    'Brown' : (161, 108, 66),
    'Brown' : (179, 105, 78),
    'Tan' : (184, 152, 105),
    'Tan' : (238, 217, 164),
    'Tan' : (254, 204, 176),
    'Tan' : (251, 198, 133),
    'Tan' : (255, 175, 125),
    'Tan' : (251, 198, 133),
    'Tan' : (206, 121, 66),
    'Orange' : (234, 131, 57),
    'Orange' : (239, 145, 33),
    'Orange' : (230, 136, 29),
    'Orange' : (179, 84, 8),
    'Orange' : (178, 72, 23),
    'Orange' : (250, 89, 71),
    'Orange' : (255, 126, 20),
    'Orange' : (255, 165, 49),
    'Orange' : (255, 188, 54),
    'Orange' : (255, 199, 0),
    'Orange' : (255, 220, 164),
    'Yellow' : (221, 152, 46),
    'Yellow' : (255, 224, 1),
    'Yellow' : (254, 232, 159),
    'Yellow' : (255, 240, 140),
    'Yellow' : (255, 252, 0),
    'Green' : (219, 243, 85),
    'Green' : (236, 238, 189),
    'Green' : (231, 242, 167),
    'Green' : (223, 224, 0),
    'Green' : (196, 224, 0),
    'Green' : (173, 210, 55),
    'Dark Green' : (171, 169, 83),
    'Dark Green' : (118, 117, 63),
    'Dark Green' : (46, 85, 67),
    'Green' : (0, 146, 61),
    'Green' : (16, 203, 49),
    'Green' : (145, 223, 140),
    'Green' : (215, 238, 209),
    'Green' : (162, 191, 163),
    'Turquoise' : (0, 162, 159),
    'Turquoise' : (0, 197, 188),
    'Blue' : (188, 229, 220),
    'Blue' : (36, 55, 87),
    'Blue' : (36, 55, 87),
    'Blue' : (0, 87, 166),
    'Blue' : (0, 159, 224),
    'Blue' : (93, 191, 228),
    'Blue' : (125, 193, 216),
    'Blue' : (106, 206, 224),
    'Blue' : (138, 212, 225),
    'Blue' : (130, 173, 216),
    'Blue' : (188, 209, 237),
    'Blue' : (200, 217, 225),
    'Blue' : (136, 153, 171),
    'Blue' : (32, 50, 176),
    'Blue' : (52, 72, 164),
    'Blue' : (80, 108, 239),
    'Purple' : (120, 98, 206),
    'Purple' : (147, 145, 228),
    'Purple' : (205, 204, 238),
    'Purple' : (201, 202, 226),
    'Purple' : (95, 38, 131),
    'Purple' : (122, 35, 141),
    'Purple' : (175, 49, 149),
    'Purple' : (198, 137, 217),
    'Purple' : (211, 189, 227),
    'Purple' : (224, 170, 217),
    'Purple' : (181, 125, 165),
    'Pink' : (183, 34, 118),
    'Pink' : (239, 91, 179),
    'Pink' : (247, 133, 177),
    'Pink' : (247, 188, 218),
    'Pink' : (245, 205, 214),
    'Pink' : (242, 211, 209),
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


# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to necessary directories
model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')
uploads_dir = os.path.join(script_dir, '..', 'uploads')
input_dir = os.path.join(script_dir, '..', 'input')
output_dir = os.path.join(script_dir, '..', 'output')

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
    from .lego_guesser import predictor

    print("Processing new frame...")

    prediction_label = None
    valid_contours = []

    # Decode the base64 image data
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    image_input = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Remove the background from the image
    image_no_bg = remove_background(image_data)

    image_rgb = cv2.cvtColor(image_no_bg, cv2.COLOR_BGR2RGB)

    mask = cv2.inRange(image_no_bg, np.array([1, 1, 1]), np.array([255, 255, 255]))

    average_color = cv2.mean(image_rgb, mask=mask)[:3]  # [:3] ignores the alpha channel if present


    # Ensure the background-removed image is valid
    if image_no_bg is None:
        raise ValueError("Background removal failed. Check the image data.")

    # Convert the background-removed image to grayscale for contour detection
    image_gray = cv2.cvtColor(image_no_bg, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur and thresholding to detect contours
    blurred_gray = cv2.GaussianBlur(image_gray, (5, 5), 0)
    _, image_threshold = cv2.threshold(blurred_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours in the thresholded image
    contours, _ = cv2.findContours(image_threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    height, width, _ = image_no_bg.shape
    valid_contours = []
    prediction_label = None

    for contour in contours:
        contour_area = cv2.contourArea(contour)
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w) / h
        edge_noise = x == 0 or y == 0 or (x + w) == width or (y + h) == height

        # Filter valid contours by size, aspect ratio, and avoid edge noise
        if contour_area > 1300 and aspect_ratio <= 6 and not edge_noise:
            norm_x = x / width
            norm_y = y / height
            norm_w = w / width
            norm_h = h / height
            valid_contours.append([norm_x, norm_y, norm_w, norm_h])

            # Crop the valid region from the image
            cropped_image = image_no_bg[y:y + h, x:x + w]
            avg_color = average_dark_color(cropped_image)

            # Pad and equalize the cropped image for model prediction
            if w > h:
                pad = (w - h) // 2
                cropped_image = cv2.copyMakeBorder(cropped_image, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=avg_color)
            else:
                pad = (h - w) // 2
                cropped_image = cv2.copyMakeBorder(cropped_image, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=avg_color)
            cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
            cv2.imwrite(os.path.join(output_dir,'cropped.jpg'), cropped_image)

            # Predict the label for the cropped image
            try:
                prediction_label = predictor(cropped_image, model)
            except Exception as e:
                print(f"Error during prediction: {e}")
            print("Prediction:", prediction_label)

    # Draw bounding boxes around the detected contours
    image_with_boxes = image_input.copy()
    for contour in valid_contours:
        norm_x, norm_y, norm_w, norm_h = contour
        x_scaled = int(norm_x * width)
        y_scaled = int(norm_y * height)
        w_scaled = int(norm_w * width)
        h_scaled = int(norm_h * height)
        cv2.rectangle(image_with_boxes, (x_scaled, y_scaled), (x_scaled + w_scaled, y_scaled + h_scaled), (0, 255, 0), 2)

    # Save the output image with bounding boxes
    output_image_path = os.path.join(output_dir, "output_with_boxes.jpg")
    #cv2.imwrite(output_image_path, image_with_boxes)



    average_color = closest_color(average_color)

    return valid_contours, prediction_label, average_color


# Example usage:
# user_image_name = "318B2DF1-B57C-4033-9547-FBDFF6F2FA9C.jpg"
# user_image_path = os.path.join(uploads_dir, user_image_name)
# valid_contours, prediction = process_frame(user_image_path, model)
