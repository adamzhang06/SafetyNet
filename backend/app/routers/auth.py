from fastapi import APIRouter, Depends, Header, HTTPException

from app.auth import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["auth"])


def require_firebase_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    try:
        return verify_firebase_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/verify")
async def verify_token(user=Depends(require_firebase_user)):
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
        "name": user.get("name"),
    }
