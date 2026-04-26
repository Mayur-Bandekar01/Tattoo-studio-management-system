---
status: investigating
trigger: "Fix the messaging system to enforce proper message ownership and permissions in the Customer and Artist dashboards."
created: 2026-04-22
updated: 2026-04-22
---

# Fix Messaging Permissions

## Symptoms
- Customer can delete artist's messages if they are the recipient.
- No ownership validation in `chat_delete_msg` route beyond being a participant in the message.

## Expected Behavior
- Only the sender of a message can delete it.
- Delete option should only be visible for owned messages in the UI.

## Evidence
- `backend/routes/chat.py:149`: `chat_delete_msg` allows deletion if `(sender_id = %s AND sender_role = %s) OR (receiver_id = %s AND receiver_role = %s)`.

## Hypotheses
1. Removing the receiver check in `chat_delete_msg` will stop unauthorized backend deletions.
2. The UI renders the delete button regardless of ownership; need to update Jinja2/JS logic.

## Current Focus
- next_action: "Examine `frontend/templates/` for chat UI logic to restrict delete button visibility."
