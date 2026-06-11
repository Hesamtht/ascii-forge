# ASCII Forge

A full-stack ASCII art generator with a dark hacker-terminal UI. Type text or upload an image and get ASCII art you can copy or download as a `.txt` file.

- **Backend:** Django + Django REST Framework, using [`art`](https://pypi.org/project/art/) for text-to-ASCII and Pillow for image-to-ASCII.
- **Frontend:** React (Vite) with a CRT-style terminal aesthetic.

```
backend/    Django REST API (port 8000)
frontend/   React app (port 5173)
```

## Quick start

After one-time setup (steps 1–2 below), start everything with a single command from the project root:

```powershell
.\dev.ps1
```

This runs both servers in one terminal — Django on :8000 and Vite on :5173 — and Ctrl+C stops both. (If your execution policy blocks it: `powershell -ExecutionPolicy Bypass -File dev.ps1`.)

Alternatively, run the servers manually in two terminals:

### 1. Backend (Django)

```powershell
cd backend
python -m venv venv              # skip if venv/ already exists
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py runserver 8000
```

On macOS/Linux use `venv/bin/` instead of `venv\Scripts\`.

### 2. Frontend (React)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the frontend talks to the API at `http://localhost:8000/api` (override with a `VITE_API_BASE` env var).

## Features

- **Text mode** — type up to 200 characters, pick from ~19 curated FIGlet-style fonts (doom, block, starwars, sub-zero, …).
- **Image mode** — upload or drag-and-drop an image (≤ 5 MB), with controls for:
  - output width (40–200 characters)
  - character set (`standard`, `detailed`, `blocks`, `minimal`)
  - invert toggle (use when viewing on a dark background)
- **Copy to clipboard** and **download as `.txt`** for any result.

## API

| Method | Endpoint      | Body                                                            | Response             |
| ------ | ------------- | --------------------------------------------------------------- | -------------------- |
| GET    | `/api/fonts/` | —                                                               | `{"fonts": [...]}`   |
| POST   | `/api/text/`  | JSON `{"text": "Hi", "font": "doom"}`                           | `{"ascii": "..."}`   |
| POST   | `/api/image/` | multipart: `image` (file), `width`, `charset`, `invert`         | `{"ascii": "..."}`   |

Errors return `{"error": "message"}` with HTTP 400.

### Examples

```powershell
# Text
curl -X POST http://localhost:8000/api/text/ -H "Content-Type: application/json" -d "{\"text\":\"Hello\",\"font\":\"doom\"}"

# Image
curl -X POST http://localhost:8000/api/image/ -F "image=@photo.jpg" -F "width=120" -F "charset=detailed"
```

## How image conversion works

The image is converted to grayscale, resized to the requested width (height scaled by 0.5 to compensate for tall terminal character cells), and each pixel is mapped to a character from a dark-to-light ramp such as `@%#*+=-:. `.

## Notes

- CORS is preconfigured for the Vite dev origin (`localhost:5173`).
- This setup uses Django's dev server and `DEBUG = True` — fine for local use, not production-hardened.
