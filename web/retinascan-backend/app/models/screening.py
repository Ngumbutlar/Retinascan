from datetime import datetime, timezone
from app import db
from app.models.facility import Facility

class ScreeningRecord(db.Model):
    """
    Represents a single Diabetic Retinopathy screening session.
    Stores patient metadata, model inference results, and clinical recommendations.
    """
    __tablename__ = 'screening_records'

    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(200), nullable=False)
    patient_age = db.Column(db.Integer, nullable=False)
    patient_sex = db.Column(db.String(10), nullable=False)
    hospital_id = db.Column(db.String(100), nullable=True)
    eye = db.Column(db.String(10), nullable=False)
    
    # Foreign Keys (Assumes facility and user tables exist)
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'), nullable=True)
    facility = db.relationship('Facility', backref='screenings', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Inference Results
    grade = db.Column(db.Integer, nullable=False)
    grade_label = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    probabilities = db.Column(db.Text, nullable=False)   # Stored as JSON string
    recommendation = db.Column(db.Text, nullable=False)  # Stored as JSON string
    image_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "patient_name": self.patient_name,
            "patient_age": self.patient_age,
            "patient_sex": self.patient_sex,
            "hospital_id": self.hospital_id,
            "eye": self.eye,
            "grade": self.grade,
            "grade_label": self.grade_label,
            "confidence": self.confidence,
            "probabilities": json.loads(self.probabilities),
            "recommendation": json.loads(self.recommendation),
            "screened_at": self.created_at.isoformat()
        }