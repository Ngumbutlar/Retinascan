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
    pin = db.Column(db.String(128), nullable=False)
    
    role = db.Column(db.String(50), nullable=False, default='nurse')
    facility = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    def set_pin(self, pin: str) -> None:
        """
        Hashes a 4-digit PIN (or password) and stores it in the database.

        Args:
            pin: The numeric PIN or password string.
        """
        self.pin = bcrypt.generate_password_hash(str(pin)).decode('utf-8')

    def check_pin(self, pin: str) -> bool:
        """
        Verifies if the provided PIN/password matches the stored bcrypt hash.

        Args:
            pin: The PIN or password string to check.

        Returns:
            bool: True if it matches, False otherwise.
        """
        if not self.pin:
            return False
        return bcrypt.check_password_hash(self.pin, str(pin))

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
            "facility": self.facility,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active
        }