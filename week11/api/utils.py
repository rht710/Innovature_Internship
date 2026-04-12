import requests
import logging

logger = logging.getLogger(__name__)

def get_exchange_rate(base_currency="INR", target_currency="USD"):
    """
    Fetches the current exchange rate from an external API.
    Used to demonstrate mocking in tests.
    """
    url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        return data.get("rates", {}).get(target_currency, 0.012) # Fallback to approx rate
    except Exception as e:
        logger.error(f"Error fetching exchange rate: {e}")
        return 0.012 # Default fallback
