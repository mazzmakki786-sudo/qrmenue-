@echo off
REM ─────────────────────────────────────────────────────────────────────
REM  Daily X Post Generator — runs via Windows Task Scheduler
REM  Sends daily build-in-public post draft to your email
REM
REM  ⚠️  CREDENTIALS are NOT stored here. They live in:
REM     scripts\.env-x-post  (already in .gitignore)
REM ─────────────────────────────────────────────────────────────────────

CD /D "%~dp0.."

REM ── Load credentials from gitignored file ────────────────────────
IF EXIST "scripts\.env-x-post" (
  FOR /F "tokens=1,2 delims==" %%A IN (scripts\.env-x-post) DO SET %%A=%%B
) ELSE (
  ECHO ERROR: scripts\.env-x-post not found! Create it with:
  ECHO   GMAIL_USER=your-email@gmail.com
  ECHO   GMAIL_APP_PASS=your-app-password
  EXIT /B 1
)

REM ── Optional custom message ───────────────────────────────────────
REM If you want to add a note about today's work, set it here:
REM SET CUSTOM_MSG="Fixed the menu loading bug"

REM ── Run the generator ─────────────────────────────────────────────
node scripts\daily-x-post.js %CUSTOM_MSG%
