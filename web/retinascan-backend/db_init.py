import sys
from app import create_app
from app.extensions import db
from app.models.user import User

def init_db() -> None:
    """
    Initializes the database by creating all tables and a default admin user.
    """
    app = create_app()
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()

        admin_email = "admin@retinascan.com"
        # Check if the admin already exists to prevent duplicate entries
        admin = User.query.filter_by(email=admin_email).first()

        if not admin:
            print(f"Seeding default admin user: {admin_email}")
            new_admin = User(
                name="Admin",
                email=admin_email,
                role="admin",
                facility="RetinaScan Central"
            )
            # Using the password specified: Admin1234!
            new_admin.set_pin("Admin1234!")
            
            db.session.add(new_admin)
            db.session.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists in the database.")
            
        print("Database initialization complete.")

if __name__ == "__main__":
    init_db()