import h5py

def replace_invalid_char(file_path, invalid_char='/', replacement_char='_'):
    with h5py.File(file_path, 'r+') as f:
        def visit_func(name, node):
            if isinstance(node, h5py.Group) or isinstance(node, h5py.Dataset):
                # Checking if the name has the invalid character
                if invalid_char in name:
                    new_name = name.replace(invalid_char, replacement_char)
                    # Move the node to a new name
                    f.move(name, new_name)
                    print(f"Renamed {name} to {new_name}")

        # Visit each item and rename if necessary
        f.visititems(visit_func)

# Path to your model file
model_path = 'model_DenseNet201.h5'

# Call the function with the path to your H5 file
replace_invalid_char(model_path)
