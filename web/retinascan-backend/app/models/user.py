from datetime import datetime, timezone
from app.extensions import db, bcrypt
from typing import Dict, Any

class User(db.Model):
    """
    The User model represents a health worker who can log in to the app.
    It stores profile information and a hashed credential (PIN or password).
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    
    # Note: Stored as a String(128) to accommodate the bcrypt hash.
    password = db.Column(db.String(128), nullable=False)
    
    role = db.Column(db.String(50), nullable=False, default='nurse')
    
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    def set_password(self, password: str) -> None:
        """
        Hashes a password and stores it in the database.

        Args:
            password: The plain-text password string.
        """
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """
        Verifies if the provided password matches the stored bcrypt hash.

        Args:
            password: The plain-text password string to check.

        Returns:
            bool: True if it matches, False otherwise.
        """
        if not self.password:
            return False
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self) -> Dict[str, Any]:
        """
        Returns a dictionary representation of the user without sensitive data.

        Returns:
            Dict: Safe user data for API responses.
        """
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "facility": self.facility_ref.name if self.facility_ref else None,
            "facility_id": self.facility_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active
        }