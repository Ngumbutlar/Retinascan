import cv2
import numpy as np

"""
RetinaScan Preprocessing Service

Provides functions for cropping, enhancement (CLAHE), and tensor normalization for fundus images.
"""

def crop_black_borders(image: np.ndarray) -> np.ndarray:
    """
    Crops black borders from an image.

    Converts the image to grayscale, thresholds it to find non-black regions,
    finds the largest contour, and crops the image to the bounding rectangle
    of that contour. If no significant contour is found, the original image
    is returned.

    Args:
        image (np.ndarray): The input RGB image as a NumPy array.

    Returns:
        np.ndarray: The cropped RGB image. If no contour is found, the
                    original image is returned unchanged.
    """
    if image is None:
        return image

    # Convert to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Threshold at pixel value 10 to find non-black region
    _, thresh = cv2.threshold(gray_image, 10, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        # Find the largest contour
        largest_contour = max(contours, key=cv2.contourArea)

        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(largest_contour)

        # Crop the image to the bounding rectangle
        cropped_image = image[y:y+h, x:x+w]
        return cropped_image
    else:
        # If no contour is found, return the original image
        return image

def apply_clahe(image: np.ndarray) -> np.ndarray:
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to the
    L channel of an RGB image in LAB color space.

    Args:
        image (np.ndarray): The input RGB image as a NumPy array.

    Returns:
        np.ndarray: The enhanced RGB image.
    """
    # Convert RGB image to LAB colour space
    lab_image = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)

    # Split channels
    l_channel, a_channel, b_channel = cv2.split(lab_image)

    # Apply CLAHE only to the L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)

    # Merge channels back and convert to RGB
    lab_enhanced_image = cv2.merge([l_enhanced, a_channel, b_channel])
    enhanced_rgb_image = cv2.cvtColor(lab_enhanced_image, cv2.COLOR_LAB2RGB)

    return enhanced_rgb_image

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Accepts raw image bytes, preprocesses it for model inference.

    Args:
        image_bytes (bytes): Raw image data.

    Returns:
        np.ndarray: Normalized float32 tensor with shape (1, 224, 224, 3).
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    decoded_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if decoded_image is None:
        raise ValueError("Could not decode image bytes. Ensure it's a valid image format.")

    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(decoded_image, cv2.COLOR_BGR2RGB)

    # Call crop_black_borders()
    cropped_image = crop_black_borders(rgb_image)

    # Call apply_clahe()
    clahe_image = apply_clahe(cropped_image)

    # Resizes to (224, 224)
    resized_image = cv2.resize(clahe_image, (224, 224))

    # Normalises to float32 in range [0.0, 1.0]
    normalized_image = resized_image.astype(np.float32) / 255.0

    # Adds batch dimension: shape becomes (1, 224, 224, 3)
    tensor = np.expand_dims(normalized_image, axis=0)

    return tensor
