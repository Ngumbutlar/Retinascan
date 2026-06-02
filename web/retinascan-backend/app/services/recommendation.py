"""
RetinaScan Clinical Recommendation Service

This file contains clinician-reviewed recommendations for Diabetic Retinopathy 
severity grades. These recommendations are based on standardized clinical 
guidelines and should only be updated after formal clinical review.
"""

import logging

logger = logging.getLogger(__name__)

RECOMMENDATIONS = {
    0: {
        "severity": "No Diabetic Retinopathy Detected",
        "urgency": "Routine",
        "action": "No retinal changes detected. Continue optimising blood glucose and blood pressure control. Routine annual screening is recommended.",
        "followup": "12 months",
        "color": "#2E8B57",
        "refer": False
    },
    1: {
        "severity": "Mild Non-Proliferative Diabetic Retinopathy",
        "urgency": "Non-urgent",
        "action": "Mild microaneurysms detected. Reinforce glucose and blood pressure control. An ophthalmologist review is recommended within the next 9 months.",
        "followup": "9 months",
        "color": "#52A86A",
        "refer": True
    },
    2: {
        "severity": "Moderate Non-Proliferative Diabetic Retinopathy",
        "urgency": "Soon",
        "action": "Moderate retinal changes detected. Refer to an ophthalmologist within 1 month for formal assessment and management planning.",
        "followup": "1 month",
        "color": "#F4A261",
        "refer": True
    },
    3: {
        "severity": "Severe Non-Proliferative Diabetic Retinopathy",
        "urgency": "Urgent",
        "action": "Severe retinal changes present. High risk of progression to proliferative disease. Refer urgently to an ophthalmologist within 1-2 weeks.",
        "followup": "1-2 weeks",
        "color": "#E76F51",
        "refer": True
    },
    4: {
        "severity": "Proliferative Diabetic Retinopathy",
        "urgency": "EMERGENCY",
        "action": "Proliferative changes detected — likely neovascularisation. Emergency ophthalmology referral required within 48 hours. Do not delay.",
        "followup": "Within 48 hours",
        "color": "#C1121F",
        "refer": True
    }
}

def get_recommendation(grade: int) -> dict:
    """
    Accepts a grade integer (0-4) and returns the associated clinical recommendation.

    Args:
        grade (int): The predicted Diabetic Retinopathy severity grade.

    Returns:
        dict: The structured recommendation dictionary. Returns Grade 0 
              recommendation as a safe default if the grade is invalid.
    """
    if grade not in RECOMMENDATIONS:
        logger.warning(
            f"get_recommendation called with out-of-range grade: {grade}. "
            "Defaulting to Grade 0 (No DR) recommendation for safety."
        )
        return RECOMMENDATIONS[0]

    return RECOMMENDATIONS[grade]