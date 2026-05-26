from PIL import Image
import numpy as np

try:
    img = Image.open(r"d:\New folder\portfolio\public\okhc-logo.png").convert("RGBA")
    data = np.array(img)

    r, g, b, a = data.T
    
    # Identify near-white background
    white_areas = (r > 230) & (g > 230) & (b > 230)
    
    # Set white background to fully transparent
    data[..., 3][white_areas.T] = 0
    
    # Find all pixels that are still visible (not transparent)
    visible = data[..., 3] > 0
    
    # Force visible pixels to pure white
    data[..., 0][visible] = 255
    data[..., 1][visible] = 255
    data[..., 2][visible] = 255

    result = Image.fromarray(data)
    result.save(r"d:\New folder\portfolio\public\okhc-logo-transparent.png")
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
