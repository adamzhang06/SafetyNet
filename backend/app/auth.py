import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import settings

_firebase_app = None


def _init_firebase():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if settings.firebase_credentials_path:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        return _firebase_app

    # Fallback to Application Default Credentials
    _firebase_app = firebase_admin.initialize_app()
    return _firebase_app


def verify_firebase_token(id_token: str) -> dict:
    _init_firebase()
    return firebase_auth.verify_id_token(id_token)
