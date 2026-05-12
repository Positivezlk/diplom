# Smart Manager

Smart Manager — локальный менеджер задач на Vue 3, Vite, Pinia, FastAPI и SQLite.

## Структура

```text
backend/
  main.py          # FastAPI app и эндпоинты
  database.py      # подключение SQLite/SQLAlchemy
  models.py        # SQLAlchemy-модели и Pydantic-схемы
  security.py      # bcrypt + JWT Bearer auth
  requirements.txt
src/
  main.js
  App.vue
  router/
  stores/
  services/
  pages/
  views/
  components/
```

## Переменные окружения

Скопируйте пример и поменяйте секрет для JWT:

```bash
cp .env.example .env
```

По умолчанию backend использует SQLite-файл `backend/database.db`. Файл создаётся автоматически при первом запуске приложения.

## Запуск backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

API будет доступен на `http://localhost:8000`.

Основные эндпоинты:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users/me`
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`

Защищённые эндпоинты принимают заголовок `Authorization: Bearer <token>`.

## Запуск frontend

В отдельном терминале:

```bash
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:5173` и будет обращаться к backend по `VITE_API_URL` из `.env` или по умолчанию к `http://localhost:8000`.

## Проверка вручную

1. Откройте `http://localhost:5173/register` и создайте пользователя.
2. Перейдите на страницу входа и войдите.
3. Убедитесь, что токен сохранён в `localStorage` как `access_token`.
4. Создайте задачу на главной странице.
5. Обновите страницу — авторизация и задачи должны восстановиться.
6. Нажмите «Выйти» — защищённая страница снова потребует вход.
