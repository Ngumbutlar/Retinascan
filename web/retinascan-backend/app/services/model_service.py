try:
    import tensorflow as tf
except ImportError:
    tf = None

import numpy as np
import os
import logging
from app.services.preprocess import preprocess_image

"""
RetinaScan Model Service

This module handles model loading and inference for Diabetic Retinopathy classification.
It uses a trained TensorFlow EfficientNetB3 model.
"""

logger = logging.getLogger(__name__)

# Model configuration
MODEL_PATH = 'model/retinascan_savedmodel/model.weights.h5'
DR_CLASSES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]

# Module-level model variable to ensure it's loaded only once
_model = None

try:
    if tf and os.path.exists(MODEL_PATH):
        # Load the TensorFlow SavedModel
        _model = tf.saved_model.load(MODEL_PATH)
        logger.info(f"RetinaScan model loaded successfully from {MODEL_PATH}")
    else:
        logger.warning(f"TensorFlow not installed or model directory not found at {MODEL_PATH}. Prediction service will be unavailable.")
except Exception as e:
    logger.warning(f"An error occurred while loading the TensorFlow model from {MODEL_PATH}: {e}")
    _model = None

def predict(image_bytes: bytes) -> dict:
    """
    Performs diabetic retinopathy classification on raw image bytes.

    Args:
        image_bytes (bytes): Raw image data from an uploaded file.

    Returns:
        dict: Prediction results including grade, label, confidence, and probabilities breakdown.
              Returns a 503 error if the model is not loaded.
    """
    if _model is None:
        return {
            "error": "Inference engine unavailable. Model file could not be loaded.",
            "status_code": 503
        }

    try:
        # 1. Preprocess image into normalized float32 tensor: (1, 224, 224, 3)
        tensor = preprocess_image(image_bytes)

        # 2. Run inference
        # Calling the loaded SavedModel object invokes its default signature
        output = _model(tensor, training=False)
        
        # 3. Extract probabilities from the output tensor
        # Handle case where output might be a dictionary of tensors (common in SavedModels)
        if isinstance(output, dict):
            # Extract the probability vector (taking the first output available)
            probabilities = next(iter(output.values())).numpy()[0]
        else:
            probabilities = output.numpy()[0]

        # 4. Determine prediction results
        predicted_grade = int(np.argmax(probabilities))
        predicted_label = DR_CLASSES[predicted_grade]
        confidence_score = float(probabilities[predicted_grade]) * 100

        # 5. Create breakdown probabilities dictionary
        probabilities_breakdown = {
            DR_CLASSES[i]: float(probabilities[i]) 
            for i in range(len(DR_CLASSES))
        }

        return {
            "grade": predicted_grade,
            "grade_label": predicted_label,
            "confidence": round(confidence_score, 2),
            "probabilities": probabilities_breakdown
        }

    except Exception as e:
        logger.error(f"Inference processing error: {str(e)}")
        # Return a generic error for the API to handle
        return {
            "error": f"An internal error occurred during image analysis: {str(e)}",
            "status_code": 500
        }