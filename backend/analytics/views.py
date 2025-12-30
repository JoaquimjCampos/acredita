import json
import logging
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger('analytics')

@csrf_exempt
def events(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        # Simple IP-based rate limiting (per minute)
        ip = request.META.get('REMOTE_ADDR', 'unknown')
        limit = getattr(settings, 'ANALYTICS_RATE_LIMIT_PER_MINUTE', 120)
        key = f"analytics:ip:{ip}"
        current = cache.get(key, 0)
        if current >= limit:
            return JsonResponse({'detail': 'Too many events'}, status=429)
        cache.set(key, current + 1, timeout=60)

        # Optional header key check
        required_key = getattr(settings, 'ANALYTICS_KEY', '')
        if required_key:
            header_key = request.headers.get('X-Analytics-Key') or request.META.get('HTTP_X_ANALYTICS_KEY')
            if header_key != required_key:
                return JsonResponse({'detail': 'Unauthorized'}, status=401)

        body = request.body.decode('utf-8') if request.body else '{}'
        payload = json.loads(body)
        # Log as a single line to file/console via configured logger
        logger.info('analytics_event', extra={'event': payload})
        return HttpResponse(status=204)
    except Exception as exc:
        logger.warning(f'analytics_event_error: {exc}')
        return HttpResponse(status=204)
