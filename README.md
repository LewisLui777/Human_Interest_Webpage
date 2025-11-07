# Human Interest - 401(k) Contribution Page

This project is a simple, single-page web application for managing 401(k) contributions, built for a technical take-home assignment.

## 🚀 How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LewisLui777/Human_Interest_Webpage.git
    cd my_401k_project
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    # On Windows (in Git Bash)
    python -m venv venv
    source venv/Scripts/activate
    
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application server:**
    ```bash
    uvicorn app.main:app --reload
    ```

5.  **Open the application:**
    Open your web browser and navigate to **`http://127.0.0.1:8000`**.

---

## 🛠️ Technical Choices

* **Backend: Python (FastAPI)**
    * I chose FastAPI because it's a modern, fast, and simple Python framework. It allowed me to build a robust API with data validation (using Pydantic) very quickly, without the complexity of larger frameworks.
* **Frontend: Vanilla HTML, CSS & JavaScript**
    * I intentionally did *not* use a framework like React. For a single-page app, vanilla JS is lightweight and has no build dependencies. This means the project can be run with *only* Python installed, making it extremely easy to run and review.
* **Database: `db.json` File**
    * To meet the "must run locally" requirement without needing a database server, I used a simple `db.json` file as a flat-file database. The FastAPI backend reads from and writes to this file, providing simple and effective data persistence.
