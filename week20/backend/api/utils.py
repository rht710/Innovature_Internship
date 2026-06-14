import requests
import logging

logger = logging.getLogger(__name__)

# Simple in-memory cache for exchange rates to prevent multiple blocking calls
_exchange_rate_cache = {}

def get_exchange_rate(base_currency="INR", target_currency="USD"):
    """
    Fetches the current exchange rate from an external API.
    Caches the rate in memory to prevent blocking performance issues.
    """
    cache_key = (base_currency, target_currency)
    if cache_key in _exchange_rate_cache:
        return _exchange_rate_cache[cache_key]

    url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
    try:
        response = requests.get(url, timeout=1.5) # Fast timeout
        response.raise_for_status()
        data = response.json()
        rate = data.get("rates", {}).get(target_currency, 0.012)
        _exchange_rate_cache[cache_key] = rate
        return rate
    except Exception as e:
        logger.error(f"Error fetching exchange rate: {e}")
        # Return fallback but don't cache failures
        return 0.012

