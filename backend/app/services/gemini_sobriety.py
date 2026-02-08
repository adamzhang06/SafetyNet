import json
import logging
import re

import httpx

from app.config import settings
from app.models import RecommendationRequest, SobrietyResult, SobrietyTelemetry

logger = logging.getLogger(__name__)

BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
# Try in order; 403 often means billing or key restrictions for that model.
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-001"]


def _extract_text_from_gemini_response(data: dict) -> str | None:
    """Extract generated text from Gemini API response. Returns None if blocked or empty."""
    if not isinstance(data, dict):
        return None
    candidates = data.get("candidates")
    if not candidates or not isinstance(candidates, list):
        feedback = data.get("promptFeedback", {}) or {}
        block_reason = feedback.get("blockReason") or feedback.get("blockReasonMessage")
        if block_reason:
            logger.warning("Gemini prompt blocked: %s", block_reason)
        return None
    first = candidates[0] if candidates else {}
    if not isinstance(first, dict):
        return None
    finish_reason = first.get("finishReason", "")
    if finish_reason in ("SAFETY", "RECITATION", "OTHER") or not finish_reason:
        if finish_reason:
            logger.warning("Gemini response blocked or limited: finishReason=%s", finish_reason)
    content = first.get("content") or {}
    parts = content.get("parts") or []
    if not parts or not isinstance(parts, list):
        return None
    part = parts[0] if parts else {}
    if not isinstance(part, dict):
        return None
    text = part.get("text")
    if text is None or (isinstance(text, str) and not text.strip()):
        return None
    return text.strip() if isinstance(text, str) else None


async def _gemini_generate(
    prompt: str,
    http_client: httpx.AsyncClient,
    max_output_tokens: int = 512,
) -> str | None:
    """Call Gemini with the given prompt; try each model in order. Returns response text or None."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
            "responseMimeType": "application/json",
        },
    }
    key = settings.google_gemini_api_key
    last_error: str | None = None
    for model in GEMINI_MODELS:
        url = f"{BASE_URL}/{model}:generateContent?key={key}"
        try:
            r = await http_client.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
            text = _extract_text_from_gemini_response(data)
            if text:
                return text
            last_error = "Empty or blocked response"
        except httpx.HTTPStatusError as e:
            last_error = f"{e.response.status_code}: {e.response.text}"
            if e.response.status_code in (403, 404, 429):
                logger.warning(
                    "Gemini %s for model %s (rate limit/billing or not found; trying next or using fallback): %s",
                    e.response.status_code,
                    model,
                    (e.response.text or "")[:400],
                )
                continue
            logger.exception("Gemini API HTTP error: %s %s", e.response.status_code, e.response.text)
            return None
        except (httpx.RequestError, json.JSONDecodeError) as e:
            logger.exception("Gemini request or parse error: %s", e)
            return None
    if last_error:
        logger.warning("Gemini failed for all models. Last error: %s", last_error)
    return None


async def get_sobriety_assessment(
    telemetry: SobrietyTelemetry,
    http_client: httpx.AsyncClient,
) -> SobrietyResult:
    """POST telemetry to Gemini; return parsed JSON { sobriety_score, recommendation, is_emergency }."""
    if not settings.google_gemini_api_key:
        return SobrietyResult(
            sobriety_score=50,
            recommendation="Gemini API key not configured. Cannot assess sobriety.",
            is_emergency=False,
        )
    prompt = _build_prompt(telemetry)
    text = await _gemini_generate(prompt, http_client, max_output_tokens=512)
    if not text:
        return SobrietyResult(
            sobriety_score=50,
            recommendation="Assessment temporarily unavailable. Please try again.",
            is_emergency=False,
        )
    parsed = _parse_json_response(text)
    return SobrietyResult(
        sobriety_score=int(parsed.get("sobriety_score", 50)),
        recommendation=str(parsed.get("recommendation", "Unable to assess.")),
        is_emergency=bool(parsed.get("is_emergency", False)),
    )


def _build_prompt(t: SobrietyTelemetry) -> str:
    constraint = (
        " CRITICAL: If the user's BAC (blood alcohol content) is greater than 0.08, "
        "you MUST recommend that they do not drive, regardless of game performance."
    )
    return (
        "You are a safety assistant. Based on the following sobriety test telemetry (including BAC), "
        "return a JSON object with exactly: sobriety_score (0-100, 100 = fully sober), "
        "recommendation (short string), is_emergency (boolean). "
        "Consider: the user's BAC, high jitter, slow/late reactions (reaction_latencies_ms), and many typos as signs of impairment. "
        "Set is_emergency true only if you believe the person may be in immediate danger."
        + constraint
        + "\n\nTelemetry:\n"
        + t.model_dump_json(indent=2)
        + "\n\nRespond with only valid JSON, no markdown."
    )


async def get_sobriety_recommendation(
    body: RecommendationRequest,
    http_client: httpx.AsyncClient,
) -> SobrietyResult:
    """Return a short recommendation string based on BAC and optional reaction time (for dashboard)."""
    if not settings.google_gemini_api_key:
        return SobrietyResult(
            sobriety_score=50,
            recommendation="API key not configured. Stay safe: if you've been drinking, don't drive.",
            is_emergency=False,
        )
    prompt = (
        "You are a safety assistant. Based ONLY on the following, return a JSON object with exactly: "
        "sobriety_score (0-100, 100=fully sober), recommendation (one short sentence for the user), is_emergency (boolean). "
        "Consider: BAC above 0.08 is illegal to drive in the US; above 0.15 is high risk. "
        "Reaction time over 400ms may suggest impairment. Set is_emergency true only if immediate danger.\n\n"
        f"BAC: {body.bac:.3f}\n"
    )
    if body.reaction_time_ms is not None:
        prompt += f"Reaction time (ms): {body.reaction_time_ms}\n"
    prompt += "\nRespond with only valid JSON, no markdown."
    text = await _gemini_generate(prompt, http_client, max_output_tokens=256)
    if not text:
        return _bac_fallback_recommendation(body.bac)
    parsed = _parse_json_response(text)
    return SobrietyResult(
        sobriety_score=int(parsed.get("sobriety_score", 50)),
        recommendation=str(parsed.get("recommendation", "Stay safe.")),
        is_emergency=bool(parsed.get("is_emergency", False)),
    )


def _bac_fallback_recommendation(bac: float) -> SobrietyResult:
    """Return a safe fallback when Gemini is unavailable; still give BAC-based guidance."""
    if bac >= 0.15:
        rec = "High BAC. Do not drive. Consider a ride share or designated driver."
    elif bac >= 0.08:
        rec = "BAC at or above legal limit. Do not drive."
    elif bac > 0:
        rec = "You have consumed alcohol. Allow time before driving or use a ride share."
    else:
        rec = "You are sober. Stay safe."
    return SobrietyResult(sobriety_score=max(0, min(100, int(100 - bac * 500))), recommendation=rec, is_emergency=False)


def _parse_json_response(text: str | None) -> dict:
    if text is None:
        return {"sobriety_score": 50, "recommendation": "Unable to assess.", "is_emergency": False}
    text = text.strip()
    if not text:
        return {"sobriety_score": 50, "recommendation": "Unable to assess.", "is_emergency": False}
    # Remove markdown code block if present
    if text.startswith("```"):
        text = re.sub(r"^```\w*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError) as _:
        return {
            "sobriety_score": 50,
            "recommendation": "Unable to assess. Response could not be parsed.",
            "is_emergency": False,
        }
