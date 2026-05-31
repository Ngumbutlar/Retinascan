import sys
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.facility import Facility

def init_db() -> None:
    """
    Initializes the database by creating all tables and a default admin user.
    """
    app = create_app()
    with app.app_context():
        print("Dropping all existing tables...")
        db.drop_all()
        
        print("Creating all database tables...")
        db.create_all()

        # 1. Define Seed Data
        facilities_to_seed = [
            {"name": "Bingo Annex Hospital", "location": "Bamenda, NW Region"},
            {"name": "Acha Annex Eye Clinic", "location": "Bamenda, NW Region"},
            {"name": "Mbingo Baptist Hospital", "location": "Mbingo, NW Region"},
        ]

        users_to_seed = [
            {
                "name": "Admin User",
                "email": "admin@retinascan.com",
                "password": "1234",
                "role": "admin",
                "facility_name": "Bingo Annex Hospital"
            },
            {
                "name": "Nurse Acha",
                "email": "nurse@acha.com",
                "password": "1234",
                "role": "nurse",
                "facility_name": "Acha Annex Eye Clinic"
            },
            {
                "name": "Technician Mbingo",
                "email": "tech@mbingo.com",
                "password": "1234",
                "role": "technician",
                "facility_name": "Mbingo Baptist Hospital"
            }
        ]

        # 2. Seed Facilities
        created_facilities = {}
        fac_count = 0
        for fac_data in facilities_to_seed:
            existing = Facility.query.filter_by(name=fac_data["name"]).first()
            if not existing:
                facility = Facility(name=fac_data["name"], location=fac_data["location"])
                db.session.add(facility)
                db.session.flush()  # To get the ID before commit
                created_facilities[facility.name] = facility
                print(f"Created Facility: {facility.name}")
                fac_count += 1
            else:
                created_facilities[existing.name] = existing

        # 3. Seed Users
        user_count = 0
        for user_data in users_to_seed:
            existing = User.query.filter_by(email=user_data["email"]).first()
            if not existing:
                facility = created_facilities.get(user_data["facility_name"])
                
                new_user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    role=user_data["role"],
                    facility_ref=facility
                )
                # set_password hashes the password using bcrypt automatically
                new_user.set_password(user_data["password"])
                
                db.session.add(new_user)
                print(f"Created User: {new_user.name} ({new_user.role}) at {user_data['facility_name']}")
                user_count += 1

        db.session.commit()

        # 4. Final Summary
        print("\n" + "="*30)
        print("DATABASE INITIALIZATION SUMMARY")
        print("="*30)
        print(f"Total Facilities Created: {fac_count}")
        print(f"Total Users Created:      {user_count}")
        print("="*30)
        print("Initialization complete.")

if __name__ == "__main__":
    init_db()