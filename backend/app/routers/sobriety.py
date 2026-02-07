from fastapi import APIRouter, Request

from app.models import SobrietyResult, SobrietyTelemetry
from app.services.gemini_sobriety import get_sobriety_assessment

router = APIRouter(prefix="/sobriety", tags=["sobriety"])


@router.post("/assess", response_model=SobrietyResult)
async def assess_sobriety(body: SobrietyTelemetry, request: Request):
    http_client = request.app.state.http_client
    return await get_sobriety_assessment(body, http_client)
