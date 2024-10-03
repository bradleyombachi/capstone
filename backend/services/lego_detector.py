import cv2
import os 
import uuid 
import numpy as np 
import base64
from datetime import datetime

# Get the current script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the uploads directory
model_dir = os.path.join(script_dir, '..', 'models/Densnet_169_20.keras')

# Construct the path to the uploads directory
uploads_dir = os.path.join(script_dir, '..', 'uploads')

# construct the path to input dir
input_dir = os.path.join(script_dir, '..', 'input')

# construct the path to input dir
output_dir = os.path.join(script_dir, '..', 'output')


# function to calculate the average of pixels darker than 50
def average_dark_color (image): 
    dark_pixels = image[np.all(image < [50, 50, 50], axis =- 1)]
    # fallback if there are no pixels found
    if dark_pixels.size == 0:
        return [25, 25, 25]
    return np.mean(dark_pixels, axis=0)

# pre process the image 
def process_image (image_path, bg_image_path, output_dir): 
    import requests

    response = requests.post(
        'https://api.remove.bg/v1.0/removebg',
        files={'image_file': open(image_path, 'rb')},
        data={'size': 'auto'},
        headers={'X-Api-Key': 'ZUho38RByEv2TDmXciiqAqW9'},
    )
    if response.status_code == requests.codes.ok:
        with open('no-bg.png', 'wb') as out:
            out.write('./output/'+datetime.now()+'nobg.jpg')
    else:
        print("Error:", response.status_code, response.text)

    
    image_input = cv2.imread(image_path)
    image_bg = cv2.imread(bg_image_path)

    # adjust the background to the same sixe as the input image 
    image_bg = cv2.resize(image_bg, (image_input.shape[1], image_input.shape[0]), interpolation=cv2.INTER_AREA)

    # convert images into grayscale 
    image_bg_gray = cv2.cvtColor(image_bg, cv2.COLOR_BGR2GRAY)
    image_input_gray = cv2.cvtColor(image_input, cv2.COLOR_BGR2GRAY)

    # calculate the difference between the background and the input image
    diff_gray = cv2.absdiff(image_bg_gray, image_input_gray)

    # gaussian blur to smooth the pixels
    diff_gray_blur = cv2.GaussianBlur(diff_gray, (5, 5), 0)

    # find threshold to convert to binary image using Otsu's method
    ret, image_treshold = cv2.threshold(diff_gray_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # find contours
    arr_cnt, _ = cv2.findContours(image_treshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # filter the valid contours
    # - eliminate pixel groups of area below minmum of 1x1 brick
    # - eliminate pixels found within the lego edges 
    # - eliminate the pixel groups that dimension ratio exceeeds 1x6 brick 

    # filter valid contours 
    height, width, _ = image_input.shape
    valid_contours = []

    for i, contour in enumerate(arr_cnt):
        ca = cv2.contourArea(contour)
        x, y, w, h = cv2.boundingRect(contour)

        # aspect ration for the enlongated pixel area (morethan the longest brick 1x6)
        aspect_ratio = float(w)/ h

        # eliminated noise pixels 
        edge_noise = x == 0 or y == 0 or (x+w) == width or (y+h) == height

        if ca > 13000 and aspect_ratio <= 6 and not edge_noise: 
            valid_contours.append(i)

    # Output results
    img_withcontours = image_input.copy()
    cv2.drawContours(img_withcontours, arr_cnt, -1, (0, 255, 0), 3)

    # Display object detection results
    object_count = len(valid_contours)
    print(f"{object_count} object{'s' if object_count != 1 else ''} detected")

    img_withrectangle = image_input.copy()

    bricks_data = []
    for i in valid_contours:
        x, y, w, h = cv2.boundingRect(arr_cnt[i])
        unique_filename = f"brick_{i}_{uuid.uuid4()}.jpg"
        brick_info = {
            "id": i,
            "position": {"x": x, "y": y},
            "size": {"width": w, "height": h},
        }
        bricks_data.append(brick_info)

        crop_img = image_input[y:y + h, x:x + w]
        avg_color = average_dark_color(crop_img)

        if w > h:
            pad = (w - h) // 2
            crop_img = cv2.copyMakeBorder(crop_img, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=avg_color)
        else:
            pad = (h - w) // 2
            crop_img = cv2.copyMakeBorder(crop_img, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=avg_color)

        crop_img = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
        cv2.imwrite(f"{output_dir}/{unique_filename}", crop_img)
        cv2.rectangle(img_withrectangle, (x, y), (x + w, y + h), (0, 255, 0), 2)


    return bricks_data

def process_frame(image_data, bg_image_path, model): 
    from .lego_guessuer import predictor
    # Decode the base 64 image 
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    image_input = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    #cv2.imwrite(cropped_image_path, image_input)
    
    # Read and resize the background image
    image_bg = cv2.imread(bg_image_path)
    if image_bg is None:
        raise ValueError(f"Background image not found at path: {bg_image_path}")

    image_bg = cv2.resize(image_bg, (image_input.shape[1], image_input.shape[0]), interpolation=cv2.INTER_AREA)

    # Convert images to grayscale 
    image_bg_gray = cv2.cvtColor(image_bg, cv2.COLOR_BGR2GRAY)
    image_input_gray = cv2.cvtColor(image_input, cv2.COLOR_BGR2GRAY)

    # Calculate the difference between the background and the input image
    diff_gray = cv2.absdiff(image_bg_gray, image_input_gray)
    diff_gray_blur = cv2.GaussianBlur(diff_gray, (5, 5), 0)
    ret, image_threshold = cv2.threshold(diff_gray_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours
    arr_cnt, _ = cv2.findContours(image_threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    height, width, _ = image_input.shape
    valid_contours = []

    for contour in arr_cnt:
        ca = cv2.contourArea(contour)
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w) / h
        edge_noise = x == 0 or y == 0 or (x + w) == width or (y + h) == height

        if ca > 1300 and aspect_ratio <= 6 and not edge_noise:
            # Normalize coordinates by the width and height of the image
            norm_x = x / width
            norm_y = y / height
            norm_w = w / width
            norm_h = h / height
            valid_contours.append([norm_x, norm_y, norm_w, norm_h])

            # Save the cropped image
            cropped_image = image_input[y:y + h, x:x + w]
            avg_color = average_dark_color(cropped_image)

            # pad and equalize all images
            if w > h:
                pad = (w - h) // 2
                cropped_image = cv2.copyMakeBorder(cropped_image, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=avg_color)
            else:
                pad = (h - w) // 2
                cropped_image = cv2.copyMakeBorder(cropped_image, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=avg_color)
            cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
            unique_filename = f"cropped.jpg"
            cropped_image_path = os.path.join(output_dir, unique_filename)
            
            # Save the cropped image
            cv2.imwrite(cropped_image_path, cropped_image)
            prediction = predictor(cropped_image, model)
            if not(prediction):
                print("shit")
            print(prediction)
            

    # Display object detection results
    # object_count = len(valid_contours)
    # print(f"{object_count} object{'s' if object_count != 1 else ''} detected")
            
    # img_withcontours = image_input.copy()
    # cv2.drawContours(img_withcontours, arr_cnt, -1, (0, 255, 0), 3)
    # contimage_path = os.path.join(output_dir, "contimage.jpg")
    # cv2.imwrite(contimage_path, img_withcontours)
    
    img_withrectangle = image_input.copy()
    for x, y, w, h in valid_contours:
        # Scale back to original dimensions for drawing
        x_scaled = int(x * width)
        y_scaled = int(y * height)
        w_scaled = int(w * width)
        h_scaled = int(h * height)

        # set the bounding rectangle 
        cv2.rectangle(img_withrectangle, (x_scaled, y_scaled), (x_scaled + w_scaled, y_scaled + h_scaled), (0, 255, 0), 2)

    rectimage_path = os.path.join(output_dir, "rectimage.jpg")
    cv2.imwrite(rectimage_path, img_withrectangle)


    return valid_contours,prediction




    



# Construct the full path to the user image
user_image_name = "318B2DF1-B57C-4033-9547-FBDFF6F2FA9C.jpg"
user_image_path = os.path.join(uploads_dir, user_image_name)

# construct the full path to the bg image 
bg_image_name = "background_backlit_B.jpg"
bg_image_path = os.path.join(input_dir, bg_image_name)

# Now call the process_image function with the full path
#bricks = process_image(user_image_path, bg_image_path, output_dir)

# Example usage
#print(bricks)