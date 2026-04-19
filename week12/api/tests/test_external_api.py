import pytest
import responses
from api.utils import get_exchange_rate

@responses.activate
def test_get_exchange_rate_mocked():
    """
    Tests the exchange rate utility by mocking the external API response.
    Satisfies the requirement: Mock external API.
    """
    # Define the mock response
    mock_url = "https://api.exchangerate-api.com/v4/latest/INR"
    mock_response_data = {
        "rates": {
            "USD": 0.015
        }
    }
    
    responses.add(
        responses.GET,
        mock_url,
        json=mock_response_data,
        status=200
    )
    
    # Call the utility
    rate = get_exchange_rate(base_currency="INR", target_currency="USD")
    
    # Assert the mock was used
    assert rate == 0.015
    assert len(responses.calls) == 1
    assert responses.calls[0].request.url == mock_url

def test_get_exchange_rate_failure_fallback():
    """
    Tests that the utility falls back to a default value if the API fails.
    """
    with responses.RequestsMock() as rsps:
        rsps.add(
            responses.GET,
            "https://api.exchangerate-api.com/v4/latest/INR",
            status=500
        )
        
        rate = get_exchange_rate("INR", "USD")
        assert rate == 0.012 # Fallback value defined in utils.py
