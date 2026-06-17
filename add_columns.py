import os
from sqlmodel import text
from database import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN country VARCHAR DEFAULT 'Nigeria'"))
            print("Added country column")
        except Exception as e:
            print(f"Error adding country: {e}")
            
        try:
            conn.execute(text("ALTER TABLE registrations ADD COLUMN city VARCHAR DEFAULT ''"))
            print("Added city column")
        except Exception as e:
            print(f"Error adding city: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
