from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Conv2D

def custom_layer(**kwargs):
    # Check if the name needs to be adjusted
    if 'name' in kwargs and '/' in kwargs['name']:
        kwargs['name'] = kwargs['name'].replace('/', '_')
    return Conv2D(**kwargs)

model = load_model('lego_predicter.h5', custom_objects={'Conv2D': custom_layer})
