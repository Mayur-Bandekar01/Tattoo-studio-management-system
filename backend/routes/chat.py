# routes/chat.py
from flask import Blueprint, request, session, jsonify
from ..db import get_db

chat_bp = Blueprint("chat", __name__)


# ── GET messages for a thread ────────────────────────────────
@chat_bp.route("/chat/messages")
def chat_get_messages():
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"error": "Unauthorized"}), 401

    user_id = str(session["user_id"])
    other_id = request.args.get("other_id", "").strip()
    other_role = request.args.get("other_role", "").strip()

    if not other_id or other_role not in ("customer", "artist"):
        return jsonify({"error": "Invalid params"}), 400

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT * FROM messages
            WHERE (
                    (sender_id=%s AND sender_role=%s AND receiver_id=%s AND receiver_role=%s)
                 OR (sender_id=%s AND sender_role=%s AND receiver_id=%s AND receiver_role=%s)
              )
            ORDER BY sent_at ASC LIMIT 300
        """,
            (user_id, role, other_id, other_role, other_id, other_role, user_id, role),
        )
        rows = cursor.fetchall()

        # Mark incoming messages in this thread as read
        cursor.execute(
            """
            UPDATE messages SET is_read = 1
            WHERE receiver_id=%s AND receiver_role=%s
              AND sender_id=%s AND sender_role=%s
              AND is_read=0
        """,
            (user_id, role, other_id, other_role),
        )
        conn.commit()

    messages = [
        {
            "message_id": r["message_id"],
            "content": r["content"],
            "sent_at": r["sent_at"].strftime("%H:%M") if r["sent_at"] else "",
            "sent_date": r["sent_at"].strftime("%b %d") if r["sent_at"] else "",
            "is_mine": (r["sender_id"] == user_id and r["sender_role"] == role),
        }
        for r in rows
    ]

    return jsonify({"messages": messages})


# ── POST send a message ──────────────────────────────────────
@chat_bp.route("/chat/send", methods=["POST"])
def chat_send():
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    content = data.get("content", "").strip()
    other_id = str(data.get("other_id", "")).strip()
    other_role = data.get("other_role", "").strip()
    appt_id = data.get("appointment_id") or None

    if not content or not other_id or other_role not in ("customer", "artist"):
        return jsonify({"error": "Missing fields"}), 400
    if len(content) > 2000:
        return jsonify({"error": "Message too long"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO messages
                (sender_id, sender_role, receiver_id, receiver_role, appointment_id, content)
            VALUES (%s, %s, %s, %s, %s, %s)
        """,
            (str(session["user_id"]), role, other_id, other_role, appt_id, content),
        )
        conn.commit()
    return jsonify({"success": True})


# ── GET total unread count (for nav badge) ───────────────────
@chat_bp.route("/chat/unread")
def chat_unread_count():
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"count": 0})

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) AS cnt FROM messages
            WHERE receiver_id=%s AND receiver_role=%s AND is_read=0
        """,
            (str(session["user_id"]), role),
        )
        row = cursor.fetchone()
    return jsonify({"count": int(row["cnt"]) if row else 0})


# ── GET per-thread unread counts (for thread-list dots) ──────
@chat_bp.route("/chat/unread-threads")
def chat_unread_threads():
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"threads": []})

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        cursor.execute(
            """
            SELECT sender_id, COUNT(*) AS cnt
            FROM messages
            WHERE receiver_id=%s AND receiver_role=%s AND is_read=0
            GROUP BY sender_id
        """,
            (str(session["user_id"]), role),
        )
        rows = cursor.fetchall()

    return jsonify(
        {
            "threads": [
                {
                    "sender_id": r["sender_id"],
                    "count": int(r["cnt"]),
                }
                for r in rows
            ]
        }
    )


# ── GET conversation threads for current user ────────────────
@chat_bp.route("/chat/threads")
def chat_threads():
    """Return all conversation partners for the logged-in user,
    with the latest message snippet and unread count."""
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"threads": []})

    user_id = str(session["user_id"])
    other_role = "artist" if role == "customer" else "customer"
    name_col = "artist_name" if other_role == "artist" else "customer_name"
    id_col = "artist_id" if other_role == "artist" else "customer_id"
    table = "artist" if other_role == "artist" else "customer"

    conn = get_db()
    with conn.cursor(dictionary=True) as cursor:
        # Get distinct conversation partners with latest message + unread count
        cursor.execute(
            """
            SELECT m.other_id,
                   t.{name_col} AS other_name,
                   m.latest_content,
                   m.latest_at,
                   m.unread_count
            FROM (
                SELECT
                    CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END AS other_id,
                    latest.content AS latest_content,
                    latest.sent_at AS latest_at,
                    unread.cnt AS unread_count
                FROM (
                    SELECT other_id, MAX(sent_at) AS max_sent_at
                    FROM (
                        SELECT sender_id, receiver_id,
                               CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END AS other_id,
                               sent_at
                        FROM messages
                        WHERE (sender_id = %s AND sender_role = %s)
                           OR (receiver_id = %s AND receiver_role = %s)
                    ) sub
                    GROUP BY other_id
                ) ids
                JOIN messages latest ON latest.sent_at = ids.max_sent_at
                    AND (
                        (latest.sender_id = %s AND latest.receiver_id = ids.other_id)
                        OR (latest.receiver_id = %s AND latest.sender_id = ids.other_id)
                    )
                LEFT JOIN (
                    SELECT sender_id AS other_id, COUNT(*) AS cnt
                    FROM messages
                    WHERE receiver_id = %s AND receiver_role = %s AND is_read = 0
                    GROUP BY sender_id
                ) unread ON unread.other_id = ids.other_id
            ) m
            JOIN {table} t ON t.{id_col} = m.other_id
            ORDER BY m.latest_at DESC
            """.format(name_col=name_col, id_col=id_col, table=table),
            (user_id, user_id, user_id, role, user_id, role,
             user_id, user_id, user_id, role),
        )
        rows = cursor.fetchall()

    threads = [
        {
            "other_id": r["other_id"],
            "other_name": r["other_name"] or "Unknown",
            "other_role": other_role,
            "latest_content": (r["latest_content"] or "")[:50],
            "latest_at": r["latest_at"].strftime("%b %d, %H:%M") if r["latest_at"] else "",
            "unread_count": int(r["unread_count"] or 0),
        }
        for r in rows
    ]

    return jsonify({"threads": threads})


# ── DELETE a message ──────────────────────────────────────────
@chat_bp.route("/chat/message/<int:message_id>", methods=["DELETE"])
def chat_delete_msg(message_id):
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    with conn.cursor() as cursor:
        # Allow deleting ONLY if you are the sender
        cursor.execute(
            """
            DELETE FROM messages 
            WHERE message_id = %s 
              AND sender_id = %s AND sender_role = %s
        """,
            (message_id, str(session["user_id"]), role),
        )
        deleted = cursor.rowcount
        conn.commit()

    if deleted > 0:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Message not found or unauthorized"}), 404


# ── DELETE a whole thread ─────────────────────────────────────
@chat_bp.route("/chat/thread/delete", methods=["POST"])
def chat_delete_thread():
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    other_id = str(data.get("other_id", "")).strip()
    other_role = data.get("other_role", "").strip()

    if not other_id or not other_role:
        return jsonify({"error": "Invalid params"}), 400

    user_id = str(session["user_id"])
    conn = get_db()
    with conn.cursor() as cursor:
        # Delete ONLY messages sent by the current user in this thread
        cursor.execute(
            """
            DELETE FROM messages
            WHERE sender_id=%s AND sender_role=%s
              AND receiver_id=%s AND receiver_role=%s
        """,
            (user_id, role, other_id, other_role),
        )
        conn.commit()
    return jsonify({"success": True})
