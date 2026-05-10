## Run

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open in browser:

- First entry/auth page: `http://127.0.0.1:8000/`
- Main application shell: `http://127.0.0.1:8000/app#/dashboard`

Flow:
1. `/` always opens `auth.html`.
2. After successful login/register, redirect goes to `/app#/dashboard`.
