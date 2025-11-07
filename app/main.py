import json
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Literal

# --- Configuration ---
DB_FILE = "app/db.json"

# --- Pydantic Models (Data Validation "Blueprints") ---
class UserInfo(BaseModel):
    age: int
    salary: int

class ContributionData(BaseModel):
    contribution_type: Literal["percent", "dollar"]
    contribution_value: float
    ytd_contributions: float
    user_info: UserInfo

# --- FastAPI App ---
app = FastAPI()

# --- Helper Functions (to read/write our "memory") ---
def read_db() -> ContributionData:
    """Reads all data from our db.json file."""
    with open(DB_FILE, "r") as f:
        data = json.load(f)
        return ContributionData(**data)

def write_db(data: ContributionData):
    """Saves new data back into our db.json file."""
    with open(DB_FILE, "w") as f:
        json.dump(data.model_dump(), f, indent=2)

# --- API Endpoints (The "Brain's" jobs) ---
@app.post("/api/contribution")
async def update_contribution(data: ContributionData):
    """
    This "listens" for the website to send *new* data to save.
    """
    try:
        current_data = read_db()
        
        # Update *only* the parts the user is allowed to change
        current_data.contribution_type = data.contribution_type
        current_data.contribution_value = data.contribution_value
        
        # Save the *entire* object back to the file
        write_db(current_data)
        
        # Send a "success" message back to the website
        return {"status": "success", "data": current_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/contribution", response_model=ContributionData)
async def get_contribution():
    """
    This "listens" for the website asking to *get* the current data.
    """
    return read_db()

# --- Serve the "Face" (The Frontend) ---

# This line "mounts" our 'static' folder.
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """
    This "listens" for anyone visiting the main page ("/")
    It just reads our index.html file and sends it to the browser.
    """
    with open("static/index.html") as f:
        return HTMLResponse(f.read())