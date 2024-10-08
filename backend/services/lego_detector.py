import cv2
import os
import numpy as np
import base64
from rembg import remove

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
    
    cv2.imwrite(output_path, image_no_bg)

    image_no_bg_bgr = cv2.cvtColor(image_no_bg, cv2.COLOR_BGRA2BGR)

    # Save the output image
    cv2.imwrite(output_path, image_no_bg_bgr)

    return image_no_bg_bgr

# Process the image and get contours and predictions
def process_frame(image_data, model):
    from .lego_guessuer import predictor

    prediction_label = None
    valid_contours = []

    # Decode the base64 image data
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    image_input = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Remove the background from the image
    image_no_bg = remove_background(image_data)

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
    cv2.imwrite(output_image_path, image_with_boxes)

    # Cleanup and release memory
    image_input = None
    image_no_bg = None
    image_with_boxes = None
    cv2.destroyAllWindows()

    return valid_contours, prediction_label


# Example usage:
# user_image_name = "318B2DF1-B57C-4033-9547-FBDFF6F2FA9C.jpg"
# user_image_path = os.path.join(uploads_dir, user_image_name)
# valid_contours, prediction = process_frame(user_image_path, model)
