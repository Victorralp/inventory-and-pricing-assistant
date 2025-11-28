from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nigeria Property Hub API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ContactEmail(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str
    message: str

class PropertyInquiryEmail(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    propertyId: str
    propertyTitle: str

class MortgageApplicationEmail(BaseModel):
    name: str
    email: EmailStr
    phone: str
    amount: float
    bank: str

class NewsletterSubscription(BaseModel):
    email: EmailStr

def send_email(to_email: str, subject: str, body: str):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")

    if not smtp_user or not smtp_pass:
        print("Warning: SMTP credentials not configured. Email not sent.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")
        raise

@app.get("/")
def read_root():
    return {"message": "Nigeria Property Hub API", "status": "active"}

@app.post("/api/email/contact")
async def send_contact_email(data: ContactEmail):
    try:
        subject = f"Contact Form: {data.subject}"
        body = f"""
        <html>
            <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {data.name}</p>
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Phone:</strong> {data.phone}</p>
                <p><strong>Subject:</strong> {data.subject}</p>
                <p><strong>Message:</strong></p>
                <p>{data.message}</p>
            </body>
        </html>
        """
        
        admin_email = os.getenv("SMTP_USER")
        send_email(admin_email, subject, body)
        
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/property-inquiry")
async def send_property_inquiry_email(data: PropertyInquiryEmail):
    try:
        subject = f"Property Inquiry: {data.propertyTitle}"
        body = f"""
        <html>
            <body>
                <h2>New Property Inquiry</h2>
                <p><strong>Property:</strong> {data.propertyTitle}</p>
                <p><strong>Property ID:</strong> {data.propertyId}</p>
                <hr>
                <p><strong>From:</strong> {data.name}</p>
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Phone:</strong> {data.phone}</p>
                <p><strong>Message:</strong></p>
                <p>{data.message}</p>
            </body>
        </html>
        """
        
        admin_email = os.getenv("SMTP_USER")
        send_email(admin_email, subject, body)
        
        confirmation_body = f"""
        <html>
            <body>
                <h2>Thank you for your inquiry!</h2>
                <p>Dear {data.name},</p>
                <p>We have received your inquiry about <strong>{data.propertyTitle}</strong>.</p>
                <p>Our team will get back to you within 24 hours.</p>
                <br>
                <p>Best regards,</p>
                <p>Nigeria Property Hub Team</p>
            </body>
        </html>
        """
        send_email(data.email, "Property Inquiry Received", confirmation_body)
        
        return {"message": "Inquiry sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/mortgage-application")
async def send_mortgage_application_email(data: MortgageApplicationEmail):
    try:
        subject = f"Mortgage Application: {data.bank}"
        body = f"""
        <html>
            <body>
                <h2>New Mortgage Application</h2>
                <p><strong>Applicant:</strong> {data.name}</p>
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Phone:</strong> {data.phone}</p>
                <p><strong>Bank:</strong> {data.bank}</p>
                <p><strong>Loan Amount:</strong> ₦{data.amount:,.2f}</p>
            </body>
        </html>
        """
        
        admin_email = os.getenv("SMTP_USER")
        send_email(admin_email, subject, body)
        
        confirmation_body = f"""
        <html>
            <body>
                <h2>Mortgage Application Received</h2>
                <p>Dear {data.name},</p>
                <p>Your mortgage application with <strong>{data.bank}</strong> has been submitted.</p>
                <p>Application Details:</p>
                <ul>
                    <li>Loan Amount: ₦{data.amount:,.2f}</li>
                    <li>Bank: {data.bank}</li>
                </ul>
                <p>We will process your application and get back to you soon.</p>
                <br>
                <p>Best regards,</p>
                <p>Nigeria Property Hub Team</p>
            </body>
        </html>
        """
        send_email(data.email, "Mortgage Application Received", confirmation_body)
        
        return {"message": "Application submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/email/newsletter")
async def subscribe_newsletter(data: NewsletterSubscription):
    try:
        subject = "Welcome to Nigeria Property Hub Newsletter"
        body = f"""
        <html>
            <body>
                <h2>Welcome to Nigeria Property Hub!</h2>
                <p>Thank you for subscribing to our newsletter.</p>
                <p>You'll receive:</p>
                <ul>
                    <li>Latest property listings</li>
                    <li>Market insights and trends</li>
                    <li>Mortgage tips and advice</li>
                    <li>Exclusive deals and offers</li>
                </ul>
                <br>
                <p>Best regards,</p>
                <p>Nigeria Property Hub Team</p>
            </body>
        </html>
        """
        
        send_email(data.email, subject, body)
        
        return {"message": "Subscribed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
