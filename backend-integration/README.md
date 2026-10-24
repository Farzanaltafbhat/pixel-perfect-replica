# Enable real Word and PDF exports in your existing FastAPI backend

The inspected backend advertises only `/`, `/health` and `POST /api/analyze-requirements`. This folder is a supplied integration module, not a server deployed by Lovable. No production server files have been changed.

## VS Code and PowerShell steps
1. Download/copy `backend-integration/proposal_exports.py` from this project into the folder containing your existing FastAPI entry file (for example `main.py`). Open that backend folder in VS Code.
2. Open VS Code's PowerShell terminal in that folder and activate your existing virtual environment:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   python -m pip install python-docx reportlab
   ```
   If your environment has another name, use its existing activation script. FastAPI and Pydantic are already dependencies of your server.
3. In the existing entry file, after `app = FastAPI(...)`, add:
   ```python
   from proposal_exports import router as proposal_export_router
   app.include_router(proposal_export_router)
   ```
   Keep your existing Gemini configuration and analysis endpoint unchanged. These export handlers do not use Gemini or any API key.
4. Add an optional document-type field to your existing analysis request model:
   ```python
   document_type: str | None = None
   ```
   The frontend sends `document_type` together with the existing fields. The inspected old schema does not define it, so the selection is retained by the frontend but may be ignored by that backend until this addition. If desired, include it in your existing analysis prompt; never put the Gemini key in the frontend.
5. Preserve your existing CORS middleware and add your actual Lovable preview origin if needed. Allow `POST`, `GET`, `OPTIONS` and the `Content-Type` header. Do not add unrestricted CORS if this backend handles private data.
6. Restart using your existing command; if your entry file is `main.py` and port is 8000:
   ```powershell
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Keep the existing ngrok tunnel pointed at this port. If ngrok changes the address, update the public frontend configuration default or the Vite build-time `VITE_API_BASE_URL` override, not Lovable Secrets.
7. Open your backend `/docs` or `/openapi.json`. Verify `POST /api/export/docx` and `POST /api/export/pdf` appear. In the app's Export page click **Retry connection**; the download buttons enable when these endpoints are advertised.
8. Create a live proposal, edit Executive Summary, proceed to Export, download both files and inspect the client, title and edited text. Exports send the latest sections in the request body and do not depend on a fabricated database ID.

PDF uses ReportLab directly; LibreOffice is not required. The default PDF fonts cover common Latin text. For additional scripts (for example Arabic), configure an appropriately licensed Unicode font and shaping on your backend before claiming multilingual PDF support.

## Security and hosting
These handlers are intended to share the same authentication, HTTPS, request-size limits and rate limiting as your existing backend. They perform content-only document generation, do not retrieve stored proposals, and do not grant approvals. Add authentication/rate limits at your backend boundary before public production use. No persistent proposal storage has been added.

## Local tests
```powershell
python -m unittest discover -s backend-integration -p "test_*.py"
```
When this folder's files are copied directly into the backend folder instead, run `python -m unittest test_proposal_exports.py` there.
