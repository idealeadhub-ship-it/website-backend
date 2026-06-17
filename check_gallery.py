from sqlmodel import Session, select, create_engine
from models.models import Gallery
import os

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ideleh"
engine = create_engine(DATABASE_URL)

def check_gallery():
    with Session(engine) as session:
        statement = select(Gallery)
        results = session.exec(statement).all()
        print(f"Total Gallery items: {len(results)}")
        
        counts = {}
        for item in results:
            m = item.meeting_name or "None"
            counts[m] = counts.get(m, 0) + 1
            
        print("Counts by meeting_name:")
        for m, count in counts.items():
            print(f"  - {m}: {count}")

if __name__ == "__main__":
    check_gallery()
