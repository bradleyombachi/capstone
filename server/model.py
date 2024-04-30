import tensorflow as tf
import numpy as np
from PIL import Image

labels = {'beam 1m': 0,
 'beam 1m 175r': 1,
 'beam 1m 314l': 2,
 'beam 1m 343l': 3,
 'beam 1x2': 4,
 'beam 1x2 126l': 5,
 'beam 1x2 330r': 6,
 'beam 1x2 336r': 7,
 'brick 1x1': 8,
 'brick 1x1 049l': 9,
 'brick 1x1 259r': 10,
 'brick 1x1 362l': 11,
 'brick 1x2': 12,
 'brick 1x2 094r': 13,
 'brick 1x2 188l': 14,
 'brick 1x2 234r': 15,
 'brick 1x2 282l': 16,
 'brick 1x2 398r': 17,
 'brick 1x3': 18,
 'brick 1x3 161r': 19,
 'brick 1x3 180l': 20,
 'brick 1x3 212l': 21,
 'brick 1x4': 22,
 'brick 1x4 000l': 23,
 'brick 1x4 059r': 24,
 'brick 1x4 096r': 25,
 'brick 1x4 236r': 26,
 'brick 2x2': 27,
 'brick 2x2 244r': 28,
 'brick 2x3': 29,
 'brick 2x3 176l': 30,
 'brick 2x4': 31,
 'brick 2x4 001r': 32,
 'brick 2x4 308r': 33,
 'brick 2x4 393r': 34,
 'brick bow 1x3': 35,
 'brick bow 1x3 037r': 36,
 'brick bow 1x3 140r': 37,
 'brick bow 1x3 201l': 38,
 'brick bow 1x3 256l': 39,
 'brick bow 1x4': 40,
 'brick bow 1x4 018l': 41,
 'brick bow 1x4 104r': 42,
 'brick bow 1x4 208r': 43,
 'brick bow 1x4 312l': 44,
 'brick corner 1x2x2': 45,
 'brick corner 1x2x2 091r': 46,
 'brick corner 1x2x2 231r': 47,
 'brick corner 1x2x2 354r': 48,
 'brick d16 w cross': 49,
 'brick d16 w cross 007r': 50,
 'brick d16 w cross 289l': 51,
 'brick d16 w cross 323l': 52,
 'brick d16 w cross 359r': 53,
 'bush 2m friction - cross axle': 54,
 'bush 2m friction - cross axle 103l': 55,
 'bush 2m friction - cross axle 179r': 56,
 'bush 2m friction - cross axle 196r': 57,
 'bush 2m friction - cross axle 318l': 58,
 'connector peg w knob': 59,
 'connector peg w knob 023l': 60,
 'connector peg w knob 280l': 61,
 'connector peg w knob 350r': 62,
 'cross block fork 2x2': 63,
 'cross block fork 2x2 250l': 64,
 'curved brick 2 knobs': 65,
 'curved brick 2 knobs 010l': 66,
 'curved brick 2 knobs 049r': 67,
 'flat tile 1x1': 68,
 'flat tile 1x1 101r': 69,
 'flat tile 1x2': 70,
 'flat tile 1x2 100r': 71,
 'flat tile 1x2 195l': 72,
 'flat tile 1x2 273l': 73,
 'flat tile 2x2': 74,
 'flat tile 2x2 255r': 75,
 'flat tile 2x2 310r': 76,
 'flat tile corner 2x2': 77,
 'flat tile corner 2x2 113l': 78,
 'flat tile corner 2x2 115l': 79,
 'flat tile corner 2x2 281l': 80,
 'flat tile corner 2x2 305r': 81,
 'flat tile round 2x2': 82,
 'flat tile round 2x2 061l': 83,
 'flat tile round 2x2 151l': 84,
 'flat tile round 2x2 294l': 85,
 'flat tile round 2x2 347r': 86,
 'lever 2m': 87,
 'lever 2m 022r': 88,
 'lever 2m 214l': 89,
 'lever 2m 283r': 90,
 'lever 3m': 91,
 'lever 3m 231l': 92,
 'lever 3m 374l': 93,
 'peg with friction': 94,
 'peg with friction 220r': 95,
 'peg with friction 365r': 96,
 'plate 1x1': 97,
 'plate 1x1 098r': 98,
 'plate 1x1 132r': 99,
 'plate 1x1 238r': 100,
 'plate 1x2': 101,
 'plate 1x2 111l': 102,
 'plate 1x2 327r': 103,
 'plate 1x2 370r': 104,
 'plate 1x2 with 1 knob': 105,
 'plate 1x2 with 1 knob 027r': 106,
 'plate 1x2 with 1 knob 070r': 107,
 'plate 1x2 with 1 knob 211l': 108,
 'plate 1x2 with 1 knob 286r': 109,
 'plate 1x3': 110,
 'plate 1x3 095r': 111,
 'plate 1x3 146l': 112,
 'plate 1x3 350r': 113,
 'plate 1x3 356r': 114,
 'plate 2 knobs 2x2': 115,
 'plate 2 knobs 2x2 110r': 116,
 'plate 2 knobs 2x2 210l': 117,
 'plate 2 knobs 2x2 394r': 118,
 'plate 2x2': 119,
 'plate 2x2 083r': 120,
 'plate 2x2 085r': 121,
 'plate 2x2 129r': 122,
 'plate 2x2 153l': 123,
 'plate 2x2 295l': 124,
 'plate 2x2 348l': 125,
 'plate 2x3': 126,
 'plate 2x3 240r': 127,
 'plate 2x3 305r': 128,
 'plate 2x3 390l': 129,
 'plate 2x4': 130,
 'plate 2x4 065r': 131,
 'plate 2x4 204l': 132,
 'plate 2x4 253l': 133,
 'plate corner 2x2': 134,
 'plate corner 2x2 136l': 135,
 'plate corner 2x2 301r': 136,
 'plate corner 2x2 396l': 137,
 'roof corner inside tile 2x2': 138,
 'roof corner inside tile 2x2 062l': 139,
 'roof corner inside tile 2x2 104l': 140,
 'roof corner inside tile 2x2 311r': 141,
 'roof corner inside tile 2x2 384l': 142,
 'roof corner outside tile 2x2': 143,
 'roof corner outside tile 2x2 000r': 144,
 'roof corner outside tile 2x2 006r': 145,
 'roof corner outside tile 2x2 137r': 146,
 'roof corner outside tile 2x2 143r': 147,
 'roof corner outside tile 2x2 210l': 148,
 'roof tile 1x1': 149,
 'roof tile 1x1 146l': 150,
 'roof tile 1x1 168r': 151,
 'roof tile 1x1 262r': 152,
 'roof tile 1x2': 153,
 'roof tile 1x2 099r': 154,
 'roof tile 1x2 133r': 155,
 'roof tile 1x2 166r': 156,
 'roof tile 1x2 215l': 157,
 'roof tile 1x2 305l': 158,
 'roof tile 1x2 352l': 159,
 'roof tile 1x2 373l': 160,
 'roof tile 1x3': 161,
 'roof tile 1x3 084l': 162,
 'roof tile 1x3 221l': 163,
 'roof tile 1x3 227l': 164,
 'roof tile 1x3 316l': 165,
 'roof tile 1x3 362l': 166,
 'roof tile 1x4': 167,
 'roof tile 1x4 116l': 168,
 'roof tile 1x4 181r': 169,
 'roof tile 1x4 320r': 170,
 'roof tile 1x4 377r': 171,
 'roof tile 2x2': 172,
 'roof tile 2x2 187l': 173,
 'roof tile 2x2 242l': 174,
 'roof tile 2x2 309r': 175,
 'roof tile 2x3': 176,
 'roof tile 2x3 008r': 177,
 'roof tile 2x3 072l': 178,
 'roof tile 2x3 081l': 179,
 'roof tile 2x3 093r': 180,
 'roof tile 2x3 105r': 181,
 'roof tile 2x3 152r': 182,
 'roof tile 2x3 269l': 183,
 'roof tile 2x3 291r': 184,
 'roof tile 2x3 297r': 185,
 'roof tile inside 3x3': 186,
 'roof tile inside 3x3 028l': 187,
 'roof tile outside 3x3': 188,
 'roof tile outside 3x3 087r': 189,
 'roof tile outside 3x3 103l': 190,
 'roof tile outside 3x3 209l': 191,
 'roof tile outside 3x3 304l': 192,
 'round brick 1x1': 193,
 'round brick 1x1 249r': 194,
 'round brick 1x1 374l': 195,
 'technic brick 1x2': 196,
 'technic brick 1x2 277r': 197}

try:
  # Load the model on boot
  model = tf.keras.models.load_model("model_DenseNet201.h5")
  print("Model loaded successfully!")
except OSError as e:
  # Handle file-related errors (e.g., model file not found)
  print(f"Error loading model: {e}")
except Exception as e:  # Catch other potential exceptions
  # Handle unexpected errors
  print(f"An unexpected error occurred: {e}")
  # Consider logging the error for further investigation

image_path = "purple_2x2_2.png"

try:
  # Load the image
  img = Image.open(image_path)

  # Handle potential grayscale conversion if needed
  if img.mode != 'RGB':
      img = img.convert('RGB')

  # Resize the image to match your model's input size
  img = img.resize((224, 224))

  # Convert to a NumPy array
  img_array = np.array(img)

  # Print the shape for verification (should be (224, 224, 3))
  print(img_array.shape)

  # Assuming your model preprocesses for 'imagenet'
  img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array.reshape((1, 224, 224, 3)))

except Exception as e:
  print(f"Error loading image: {e}")


prediction = model.predict(img_array)

# Get the index of the predicted class with the highest probability
predicted_class = np.argmax(prediction)

# Get the class label from your training data (assuming labels are encoded)
labels = dict((v, k) for k, v in labels.items())
predicted_label = labels[predicted_class]

print(f"Predicted Label: {predicted_label}")