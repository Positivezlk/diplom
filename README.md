## Run

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

You can run the app with **either** import path:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

or (for projects expecting `src.backend.main:app`):

```bash
uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Then open `http://127.0.0.1:8000/`.
