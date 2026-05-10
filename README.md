## Run

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

## Structure

- `frontend/pages/` — HTML pages (`auth.html`, `index.html`)
- `frontend/static/css/` — CSS
- `frontend/static/js/` — JS
- `data/db.json` — file storage

## URLs

- Auth page: `http://127.0.0.1:8000/`
- App page: `http://127.0.0.1:8000/app`
- Static: `http://127.0.0.1:8000/static/...`
