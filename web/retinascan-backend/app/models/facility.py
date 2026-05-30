from datetime import datetime, timezone
from app.extensions import db
from typing import Dict, Any

class Facility(db.Model):
    """
    Represents a healthcare facility or clinic.
    """
    __tablename__ = 'facilities'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    location = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    # Relationship to users
    users = db.relationship('User', backref='facility_ref', lazy=True)

    def to_dict(self) -> Dict[str, Any]:
        """
        Returns a dictionary representation of the facility.
        """
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "is_active": self.is_active
        }