from flask_mail import Message


def send_otp_email(mail_ext, customer_name, email, otp):
    """
    Sends the OTP email for password reset using the provided Mail extension.
    """
    try:
        msg = Message(
            subject="Dragon Tattoos — Your Password Reset OTP", recipients=[email]
        )
        msg.body = f"Your OTP is: {otp}\nValid for 10 minutes.\nDo not share this."
        msg.html = f"""
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{{margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;}}
.wrap{{max-width:520px;margin:30px auto;background:#fff;border-radius:12px;
       overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);}}
.hdr{{background:#1a1a2e;padding:32px 40px;text-align:center;}}
.hdr h1{{color:#fff;font-size:22px;margin:0;letter-spacing:0.15em;}}
.hdr p{{color:#c8a040;font-size:11px;margin:6px 0 0;letter-spacing:0.2em;}}
.strip{{height:4px;background:linear-gradient(90deg,#1a1a2e,#c8a040,#1a1a2e);}}
.body{{padding:36px 40px;}}
.otp-box{{background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;}}
.otp-lbl{{font-size:11px;color:#c8a040;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;}}
.otp-code{{font-size:42px;font-weight:700;color:#fff;letter-spacing:0.3em;}}
.exp{{font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px;}}
.warn{{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;
       padding:14px 18px;font-size:12px;color:#92400e;}}
.foot{{background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;}}
.foot p{{font-size:11px;color:#aaa;margin:0;}}
</style></head><body>
<div class="wrap">
  <div class="hdr"><h1>DRAGON TATTOOS</h1><p>Art Etched in Eternity</p></div>
  <div class="strip"></div>
  <div class="body">
    <p style="font-size:16px;color:#1a1a2e;font-weight:600;margin-bottom:8px;">
      Hello, {customer_name}!</p>
    <p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">
      Use the OTP below to reset your password.</p>
    <div class="otp-box">
      <p class="otp-lbl">Your One-Time Password</p>
      <div class="otp-code">{otp}</div>
      <p class="exp">Valid for 10 minutes only</p>
    </div>
    <div class="warn"><strong>Do not share this OTP with anyone.</strong></div>
  </div>
  <div class="foot"><p>Dragon Tattoos Studio | Automated email, do not reply.</p></div>
</div></body></html>"""
        mail_ext.send(msg)
        return True
    except Exception as e:
        print("EMAIL ERROR:", e)
        return False
