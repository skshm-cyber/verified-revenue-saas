# verified-revenue-saas

Project scaffold for Verified Revenue SaaS.

Created folders:
- backend/
- frontend/
- docs/

## How to Run the Project

### 1. Backend (Django)

- Make sure you are in the project root directory.
- Activate the Python virtual environment:
	```zsh
	source .venv/bin/activate
	```
- Start the Django server:
	```zsh
	python backend/manage.py runserver
	```
	If port 8000 is busy, use:
	```zsh
	python backend/manage.py runserver 8001
	```

### 2. Frontend (React)

- Go to the frontend directory:
	```zsh
	cd frontend
	```
- Install dependencies:
	```zsh
	npm install
	```
- Start the frontend server:
	```zsh
	npm run dev
	```

### 3. Common Issues & Fixes

- If you see `ModuleNotFoundError: No module named 'django'`, activate the virtual environment and run:
	```zsh
	pip install django djangorestframework
	```
- If `npm` is not found, install Node.js and npm from [nodejs.org](https://nodejs.org/).
- If port is busy, use a different port (e.g., `runserver 8001`).

---

## Quick Start

1. `source .venv/bin/activate`
2. `python backend/manage.py runserver`
3. `cd frontend && npm install && npm run dev`

---

## Project Structure
- `backend/` — Django backend
- `frontend/` — React frontend
- `.venv/` — Python virtual environment

---

For further help, ask GitHub Copilot in VS Code!


