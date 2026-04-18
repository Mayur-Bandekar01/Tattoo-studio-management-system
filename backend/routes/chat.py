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
    appt_id = request.args.get("appointment_id", "").strip() or None

    if not other_id or other_role not in ("customer", "artist"):
        return jsonify({"error": "Invalid params"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

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
    cursor = conn.cursor()
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
    cursor = conn.cursor(dictionary=True)
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
    cursor = conn.cursor(dictionary=True)
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


# ── DELETE a message ──────────────────────────────────────────
@chat_bp.route("/chat/message/<int:message_id>", methods=["DELETE"])
def chat_delete_msg(message_id):
    role = session.get("role")
    if role not in ("customer", "artist"):
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db()
    cursor = conn.cursor()

    # Allow deleting if you are sender OR receiver
    cursor.execute(
        """
        DELETE FROM messages 
        WHERE message_id = %s 
          AND (
            (sender_id = %s AND sender_role = %s)
            OR (receiver_id = %s AND receiver_role = %s)
          )
    """,
        (message_id, str(session["user_id"]), role, str(session["user_id"]), role),
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
    cursor = conn.cursor()

    # Delete all messages in the thread
    cursor.execute(
        """
        DELETE FROM messages
        WHERE (
                (sender_id=%s AND sender_role=%s AND receiver_id=%s AND receiver_role=%s)
             OR (sender_id=%s AND sender_role=%s AND receiver_id=%s AND receiver_role=%s)
          )
    """,
        (user_id, role, other_id, other_role, other_id, other_role, user_id, role),
    )

    conn.commit()
    return jsonify({"success": True})
