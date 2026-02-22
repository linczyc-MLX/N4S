# Module: Settings

> **Status**: ✅ Live | **Header**: #374151 | **Last Updated**: 2026-02-22

## Purpose
Platform configuration, user management, and admin tools. Includes project settings, user roles, and system preferences.

## Key Files
- `src/components/Settings/` — 6 files
- `api/users.php` — User management API
- `api/setup-users.php` — Initial user setup
- `api/setup.php` — System setup

## Key Patterns
- Project-level settings stored in project_data JSONB
- User authentication via AuthContext
- Admin tools for data management and system configuration
