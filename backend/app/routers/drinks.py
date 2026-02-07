from fastapi import APIRouter, Depends

from app.db import get_db
from app.models import ValidateDrinkRequest, ValidateDrinkResponse
from app.services.drink_validation import validate_drink

router = APIRouter(prefix="/validate-drink", tags=["drinks"])


@router.post("", response_model=ValidateDrinkResponse)
async def post_validate_drink(body: ValidateDrinkRequest, db=Depends(get_db)):
    return await validate_drink(db, body)
