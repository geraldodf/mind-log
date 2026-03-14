# MindLog — Future Features

This document outlines planned features for future development cycles.
The current architecture is designed to support all of these without major structural changes.

---

## 1. Public User Profiles

**Description:** Each user will have a public profile page displaying their media list, stats, and reviews.

**Planned:**
- `/u/:username` — public profile page
- Toggle visibility per entry (`PUBLIC` / `PRIVATE`) is already implemented
- Stats summary: total entries, completion rate, top-rated media

**Architecture support:**
- `visibility` field already exists on `UserMedia`
- `username` is already unique and stored in `User`
- A public API endpoint for reading public entries will be added (no auth required)

---

## 2. Following Other Users

**Description:** Users can follow other users and see a combined feed of their public activity.

**Planned:**
- `follows` table: `follower_id`, `following_id`, `created_at`
- `GET /v1/users/:username/profile` — view public profile
- `POST /v1/follows/:userId` — follow a user
- `DELETE /v1/follows/:userId` — unfollow

**Architecture support:**
- `User` entity is independent and clean — no coupling to follows yet
- Event-driven notification system can extend existing `Notification` entity

---

## 3. Social Feed / Activity Stream

**Description:** A timeline feed showing recent activity of followed users.

**Planned:**
- `activity_feed` table or materialized view
- `GET /v1/feed` — paginated activity stream
- Filter by media type, status, recommendation

**Architecture support:**
- `UserMedia.visibility` controls what appears publicly
- Scheduler infrastructure is already in place (can extend to fan-out activity)

---

## 4. Social Recommendations

**Description:** Users can share or recommend specific entries to followers directly.

**Planned:**
- `recommendations` table linking source user → target user → media entry
- In-app notification when someone shares a recommendation
- "Recommended by [user]" label on media detail

**Architecture support:**
- `Recommendation` enum on `UserMedia` can power discovery
- `Notification` entity can handle recommendation alerts

---

## 5. Community Lists / Collections

**Description:** Curated public lists created by users, grouping media thematically.

**Planned:**
- `collection` entity: id, title, description, user_id, visibility
- `collection_items` junction table: collection_id, user_media_id
- `GET /v1/collections` — public discovery
- `GET /v1/collections/:id` — view a specific list

**Architecture support:**
- `MediaType` and `Status` system is generic and does not assume single media categories
- No hardcoded categories — any collection can mix types (e.g., "Best Sci-Fi" across movies, books, games)

---

## 6. Discovery / Explore Page

**Description:** A public discovery page showing trending or highly recommended entries across all users.

**Planned:**
- Aggregated public entries with sorting by rating, recommendation count, recency
- Filter by media type
- No external API integration — purely user-generated content

**Architecture support:**
- `visibility = PUBLIC` entries are already queryable
- `recommendation` and `rating` fields enable ranking

---

## 7. Statistics & Analytics

**Description:** Personal statistics dashboard showing media consumption trends.

**Planned:**
- Entries by status (planned vs completed vs dropped)
- Entries by media type over time
- Average rating per type
- Completion timeline

**Architecture support:**
- `start_date`, `end_date`, `created_at`, `updated_at` fields are already tracked
- Clean relational model enables aggregation queries

---

## 8. Enhanced Notification System

**Description:** Extend the current basic notification system.

**Planned:**
- Email notifications (when email service is wired)
- Push notifications (mobile-ready)
- Notification preferences per user

**Architecture support:**
- `Notification` table is already in place
- `NotificationScheduler` is extensible — new triggers can be added
- User preference table can be added without breaking existing schema

---

## 9. Import / Export

**Description:** Allow users to export their library and import from other platforms.

**Planned:**
- `GET /v1/export` — download CSV or JSON of user's media list
- `POST /v1/import` — bulk import via CSV
- Mapping from common platforms (MAL, Letterboxd, Goodreads) via CSV format

**Architecture support:**
- `UserMedia` structure is generic enough to map from other platforms
- `MediaType` is flexible and user-extensible

---

## Current Architecture Strengths

| Feature | How Current Architecture Supports It |
|---|---|
| Public profiles | `visibility` on `UserMedia`, unique `username` on `User` |
| Social graph | `User` entity is clean, ready for `follows` junction table |
| Discovery | `recommendation` + `visibility` fields enable public ranking |
| Collections | Generic `MediaType` means no category lock-in |
| Stats | All date fields already tracked on `UserMedia` |
| Notifications | Extensible scheduler + `Notification` table already wired |
| Social feed | `updatedAt` on `UserMedia` enables time-sorted feeds |
