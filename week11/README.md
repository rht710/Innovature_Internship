# 🧪 Week 11: Testing, Coverage & Mocking

## 📌 Project Overview
Welcome to **Week 11: E-commerce Backend - The Quality Assurance Edition**! This week, we transitioned from building features to ensuring the system's reliability through automated testing and mocking.

The core objective was to build a "bulletproof" backend by validating every model, view, and external integration using **Pytest** and **Postman**.

---

## 🚀 Testing Suite & Reports

### 1. Prerequisites
Install the testing toolchain and dependencies:
```bash
pip install pytest pytest-django pytest-cov responses requests
```

### 2. Run All Tests
Execute our suite of 9 unit and integration tests:
```bash
python -m pytest
```

### 3. Generate Coverage Report ( Deliverable #1)
The assignment requires **80%+ coverage**. Our project achieved **90% coverage**.
```bash
python -m pytest --cov=api --cov-report=term-missing
```
> [!TIP]
> **To Submit**: Capture a screenshot of the terminal output showing the 90% TOTAL coverage.

---

## 🛠 Features & Mocking Strategy

### 1. Currency Conversion Feature (External API)
We've added a new feature that fetches real-time exchange rates to show product prices in **USD**.
- **Utility**: `api/utils.py` uses the standard API `exchangerate-api.com`.
- **API Response**: Every product in `api/products/` now includes a `price_in_usd` field calculated dynamically.

### 2. Mocking Technique ( Deliverable #2)
To satisfy the requirement of **Mocking External APIs**, we used the `responses` library to intercept network requests.
- **Why Mock?**: This ensures our tests pass even if the exchange rate API is down or if we are offline.
- **Verification**: Check `api/tests/test_external_api.py` to see how we fake the API response to test our error handling and logic.

---

## 📑 Updated API Endpoints Reference

| Endpoint | Method | New Features in Week 11 |
| :--- | :--- | :--- |
| `/api/products/` | GET | Includes `price_in_usd` (Mocked External API) |
| `/api/register/` | POST | Fully validated with unit tests |
| `/api/login/` | POST | Fully validated with unit tests |

---

## 🧪 Postman Integration ( Deliverable #3)

The `postman_collection.json` has been updated with **Automated Test Scripts**.
1. **Import** the collection into Postman.
2. **Send** a request to `List Products`.
3. **View "Test Results" tab** to see the green pass marks for:
   - `Status code is 200`
   - `Contains price_in_usd field`

> [!TIP]
> **To Submit**: Take a screenshot of the "Test Results" tab in Postman showing the green PASS indicators.

---

## 👤 Author
**Rohit Mohan**  
*Week 11 - Internship to Hire Excellence Program (I2HEP)*
