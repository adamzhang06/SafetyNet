from fastapi import APIRouter, Depends

from app.models import BACInput, BACResult, BACStatus, BiologicalSex

router = APIRouter(prefix="/bac", tags=["bac"])

R_MALE = 0.68
R_FEMALE = 0.55
BETA_PER_HOUR = 0.015


def widmark_bac(
    weight_kg: float,
    sex: BiologicalSex,
    alcohol_grams: float,
    time_elapsed_hours: float,
) -> float:
    """Widmark: BAC = [alcohol_grams / (weight_grams * r)] * 100 - (beta * hours).
    With weight_kg: peak = alcohol_grams / (weight_kg * r * 10) so ~0.02 per standard drink for 70kg male."""
    r = R_MALE if sex == BiologicalSex.MALE else R_FEMALE
    weight_grams = weight_kg * 1000
    peak_bac = (alcohol_grams / (weight_grams * r)) * 100  # BAC as decimal e.g. 0.08
    elimination = BETA_PER_HOUR * time_elapsed_hours
    bac = max(0.0, peak_bac - elimination)
    return round(bac, 4)


@router.post("/estimate", response_model=BACResult)
async def estimate_bac(body: BACInput):
    """Compute BAC from weight, sex, alcohol grams, and time elapsed (Widmark)."""
    hours = body.time_elapsed_minutes / 60.0
    bac = widmark_bac(body.weight_kg, body.sex, body.alcohol_grams, hours)
    status = BACStatus.RED if bac >= 0.12 else (BACStatus.YELLOW if bac >= 0.08 else BACStatus.GREEN)
    return BACResult(
        bac=bac,
        status=status,
        notify_guardian=(status == BACStatus.RED),
    )
