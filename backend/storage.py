import json
from pathlib import Path
from typing import Any

DB_FILE = Path(__file__).resolve().parent.parent / 'data' / 'db.json'


def load_db() -> dict[str, Any]:
    if not DB_FILE.exists():
        return {'tasks': [], 'user': {'name': 'Alex', 'email': 'alex@mail.com'}, 'theme': 'light'}
    return json.loads(DB_FILE.read_text(encoding='utf-8'))


def save_db(data: dict[str, Any]) -> None:
    DB_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
