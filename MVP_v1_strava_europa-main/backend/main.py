from fastapi import FastAPI, HTTPException
from models import ActivityCreate
from db import engine, Base, create_activity
from sqlalchemy.orm import Session

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.post("/activities")
def post_activity(activity: ActivityCreate):
    db = Session(bind=engine)
    try:
        create_activity(db, activity)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
