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






Install dependencies:

```bash
pip install -r backend/requirements.txt
```


Start server (recommended for local browser access):

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Alternative import path:

```bash
uvicorn src.backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open in browser:

- `http://127.0.0.1:8000/`
- `http://localhost:8000/`

> `0.0.0.0` is a bind address for the server, not a client URL for browser navigation.
> If you run with `--host 0.0.0.0`, still open `http://127.0.0.1:8000/` (or `localhost`).

You can run the app with **either** import path:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

or (for projects expecting `src.backend.main:app`):

```bash
uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Then open `http://127.0.0.1:8000/`.

