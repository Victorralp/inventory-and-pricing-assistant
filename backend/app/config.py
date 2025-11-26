from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "retail_assistant"
    
    # JWT
    secret_key: str = "your-secret-key-change-this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Email (Brevo)
    brevo_api_key: str = ""
    brevo_sender_email: str = "noreply@yourapp.com"
    brevo_sender_name: str = "Retail Assistant"
    
    # SMS (Africa's Talking)
    africastalking_username: str = "sandbox"
    africastalking_api_key: str = ""
    africastalking_sender: str = "RetailApp"
    
    # SMS (Twilio - alternative)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    
    # Application
    environment: str = "development"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # ML Model
    model_path: str = "../ml_module/models"
    retrain_interval_days: int = 7
    min_data_points_for_forecast: int = 30
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
