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

    def to_dict(self) -> Dict[str, Any]:
        """
        Returns a dictionary representation of the facility.
        """
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location
        }