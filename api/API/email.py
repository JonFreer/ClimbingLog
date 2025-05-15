from .config import SMTP_FROM_ADDRESS, SMTP_LOGIN, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER, Domain
from .models import User


def send_verify_email(email:str,token:str, user:User):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart


    msg = MIMEMultipart("alternative")

    TO = [email] 

    msg["Subject"] = "Verify you account"
    msg["From"] = SMTP_FROM_ADDRESS
    msg["To"] = ", ".join(TO)

    text = """\
        Hello and welcome to Volume DB,
        To access features like uploading beta you will need to verify your account.    
        Click the link below to verify your account:
        https://"""+Domain+"""/verify/""" + token 
    
    html = """\
      <html>

<style>
    td,
    th,
    div,
    p,
    a,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        font-family: "Segoe UI", sans-serif;
        mso-line-height-rule: exactly;
    }
</style>

<body style="background-color: #fff;">


    <div style="padding-left: 48px; padding-right: 48px; padding-top: 24px; padding-bottom: 24px;">
        <img src="data:image/png;base64,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"
            alt="VolumeDB Logo" style=" height: 50px; display: block; margin: auto;">

        <h1 style="text-align: center;">Verify your account</h1>

        <h3>Hello and welcome to VolumeDB,</h3>

        To access features like uploading beta you will need to verify your account.

        Click the link below to verify your account:

        <div style="height: 24px; padding-top: 30px;">

            <a style="display: block; max-width:200px; text-align: center; margin: auto; background-color: rgb(80,70,230); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
                href='https://"""+Domain+"""/verify/"""+token+"""'>Click here to verify</a>
        </div>
    </div>
</body>

</html>
        """
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    msg.attach(part1)
    msg.attach(part2)

    # Send the mail

    conn = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    conn.starttls()  # Upgrade the connection to secure
    conn.set_debuglevel(False)
    conn.login(SMTP_LOGIN, SMTP_PASSWORD)
    try:
        conn.sendmail(SMTP_FROM_ADDRESS, TO, msg.as_string())
    finally:
        conn.quit()


def send_forgot_password_email(email:str,token:str, user:User):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart


    msg = MIMEMultipart("alternative")

    TO = [email] 

    msg["Subject"] = "Reset your password"
    msg["From"] = SMTP_FROM_ADDRESS
    msg["To"] = ", ".join(TO)

    text = """\
        Hello,
        It looks like you requested a password reset for your VolumeDB account.
        Click the link below to reset your password. If you did not request this, please ignore this email.
        https://"""+Domain+"""/reset_password/""" + token 
    
    html = """\
      <html>

<style>
    td,
    th,
    div,
    p,
    a,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        font-family: "Segoe UI", sans-serif;
        mso-line-height-rule: exactly;
    }
</style>

<body style="background-color: #fff;">


    <div style="padding-left: 48px; padding-right: 48px; padding-top: 24px; padding-bottom: 24px;">
        <img src="data:image/png;base64,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"
            alt="VolumeDB Logo" style=" height: 50px; display: block; margin: auto;">

        <h1 style="text-align: center;">Password Reset</h1>

        <h3>Hello """+user.username+""",</h3>

        We have received a request to reset your password. Please confirm the reset to choose a new password. Otherwise, you can ignore this email. 


        <div style="height: 24px; padding-top: 30px;">

            <a style="display: block; max-width:200px; text-align: center; margin: auto; background-color: rgb(80,70,230); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
                href='https://"""+Domain+"""/reset_password/"""+token+"""'>Reset Password</a>
        </div>
    </div>
</body>

</html>
        """
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    msg.attach(part1)
    msg.attach(part2)

    # Send the mail

    conn = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    conn.starttls()  # Upgrade the connection to secure
    conn.set_debuglevel(False)
    conn.login(SMTP_LOGIN, SMTP_PASSWORD)
    try:
        conn.sendmail(SMTP_FROM_ADDRESS, TO, msg.as_string())
    finally:
        conn.quit()