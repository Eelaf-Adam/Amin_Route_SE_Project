from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class PrivacyScrubberMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # scrub sensitive network tags
        headers = dict(request.headers)

        # erase user fingerprints
        headers["x-forward-for"] = "0.0.0.0"
        headers["x-real-ip"] = "0.0.0.0"
        headers["user-agent"] = "Anonymized Browser Environment"
    
        # to not capture devise id
        request._headers = type(request.headers)(headers)

    
        # allow resuest proceed safely into the api route
        response: Response = await call_next(request)

        # adding safety assurance headers
        response.headers["X-Privacy-Scrubbed"] = "True"
        return response