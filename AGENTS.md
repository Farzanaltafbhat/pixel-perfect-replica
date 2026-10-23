<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Sample data lives only in `src/data/sample.ts`; all backend calls go through `src/lib/api.ts` (FastAPI via `VITE_API_BASE_URL`) so the real backend can replace samples without touching pages.
- API keys (Gemini, n8n, etc.) belong on the backend, never in frontend code.
