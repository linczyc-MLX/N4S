# N4S Claude Session Protocol

> **Purpose**: Standardized workflow for starting, running, and ending Claude sessions across all machines and interfaces.
> **Location**: `docs/memory/PROTOCOL.md`
> **Last Updated**: 2026-02-22

---

## Recognized Commands

### `Claude: Update Memory and Hand Off`
**Trigger**: End of any working session. Launches the full close-out sequence:

1. **Update `docs/memory/HANDOVER.md`** — Overwrite with current session state:
   - What was done (commits, changes)
   - Current build/deploy status
   - What's next (immediate next steps for new session)
   - Any blockers or warnings

2. **Update relevant module files** — Only modules touched this session:
   - `docs/memory/modules/{MODULE}.md` — Update status, key files, recent changes
   - `docs/memory/itr/ITR-MASTER.md` — Add/resolve/update any ITR items

3. **Update `docs/memory/ARCHITECTURE.md`** — Only if structural changes were made:
   - New files/directories, new API endpoints, new database tables, deployment changes

4. **Append to `docs/SESSION-LOG.md`** — Session entry with commits, files changed, key decisions

5. **Update Claude Memory edits** — If any memory slots need updating (hosting, deploy, data paths)

6. **Git commit + push** all memory updates as final commit

7. **Print handover prompt** — A copy-paste ready prompt for the next session

### Session Start Protocol
When starting a new session, Claude should:
```
git config --global http.proxy "$HTTPS_PROXY"
git -c http.proxyAuthMethod=basic clone N4S.git
```
Then read these files in order:
1. `docs/memory/HANDOVER.md` — What happened last, what's next
2. `docs/memory/ARCHITECTURE.md` — If unfamiliar with codebase structure
3. `docs/memory/modules/{relevant}.md` — For the module being worked on
4. `docs/memory/itr/ITR-MASTER.md` — If working on bug fixes or resolving issues

---

## File Structure

```
docs/memory/
├── PROTOCOL.md          ← You are here. Session workflow rules.
├── ARCHITECTURE.md      ← Master: tech stack, file tree, deployment, data flow
├── HANDOVER.md          ← Always-current. Overwritten every session close.
├── modules/
│   ├── DASHBOARD.md     ← Dashboard + navigation + project management
│   ├── KYC.md           ← Know Your Client — intake questionnaire
│   ├── FYI.md           ← Find Your Inspiration — taste exploration
│   ├── MVP.md           ← Mansion Validation Program — space planning
│   ├── KYM.md           ← Know Your Market — market intelligence
│   ├── KYS.md           ← Know Your Site — site assessment
│   ├── VMX.md           ← Visual Matrix — partner alignment
│   ├── BYT.md           ← Build Your Team (GID) — consultant matching + RFQ
│   ├── SETTINGS.md      ← Settings + admin configuration
│   └── LCD.md           ← LuXeBrief Client Dashboard (separate app)
└── itr/
    └── ITR-MASTER.md    ← All Items To Resolve, tagged by module
```

---

## Rules

1. **HANDOVER.md is always current** — It reflects the state as of the last session close. Any new session should be able to start from this file alone.

2. **Module files are reference, not logs** — They describe the current state of each module (files, patterns, status, gotchas). They are NOT session logs. Session-by-session history stays in SESSION-LOG.md.

3. **ARCHITECTURE.md is structural** — Tech stack, file tree, deployment pipelines, database schemas, API patterns. Updated only when the structure changes, not for feature work within existing patterns.

4. **ITR items get IDs** — Format: `ITR-{number}`. Resolved items get ~~strikethrough~~ with date. New items get the next sequential number.

5. **Memory edits are pointers** — Claude's 26-slot memory should point to these files and contain only the most critical operational rules (deploy commands, API constraints, data golden rules). Detailed knowledge lives in the .md files.

6. **Complete files only** — Never ask Michael to paste code. Provide complete edited files for upload, then after confirmation push directly to GitHub.
