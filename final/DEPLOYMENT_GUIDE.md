# Deployment Guide for Lumina Learning Platform

## Overview
This project has two parts:
- `final/frontend` — React + Vite frontend deployed to Vercel
- `final/backend` — Django backend deployed to a separate host (Render/Railway/Fly/Azure)

The backend uses Django REST Framework, Stripe, Razorpay, PayPal simulation, Channels, and Elasticsearch.

---

## Backend setup

### 1. Choose a host
Recommended:
- Render
- Railway
- Fly
- Azure App Service

### 2. Prepare production environment variables
Configure these in the backend host settings:

```text
DEBUG=False
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=<your-backend-domain>
CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
CSRF_TRUSTED_ORIGINS=https://<your-frontend-domain>
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
DATABASE_URL=<your-database-url>
REDIS_URL=<your-redis-url>  # only if using Channels and websockets
ELASTICSEARCH_URL=<your-elasticsearch-url>  # only if using Elasticsearch
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
PAYPAL_CLIENT_ID=<paypal-client-id>  # optional
PAYPAL_CLIENT_SECRET=<paypal-client-secret>  # optional
FRONTEND_URL=https://<your-frontend-domain>
BACKEND_URL=https://<your-backend-domain>
```

### 3. Backend deploy settings
Use the Django app root `final/backend`.
Set build/install commands:

```bash
pip install -r requirements.txt
```

Set start command:

```bash
daphne -b 0.0.0.0 -p $PORT learning_platform_backend.asgi:application
```

If the host requires Gunicorn for HTTP only, use:

```bash
gunicorn learning_platform_backend.wsgi:application --bind 0.0.0.0:$PORT
```

### 4. Post-deploy commands
Run after deployment:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

If you use Redis for Channels, ensure `REDIS_URL` is configured and accessible.

### 5. Stripe webhook
If you use Stripe, configure the webhook endpoint:

```text
https://<backend-domain>/api/payments/webhook/
```

Use `STRIPE_WEBHOOK_SECRET` from Stripe.

---

## Frontend setup on Vercel

### 1. Connect the repo
- Link the repo in Vercel
- Set the root directory to: `final/frontend`

### 2. Build settings
- Build command: `npm run build`
- Output directory: `dist`

### 3. Environment variable
Add in Vercel:

```text
VITE_API_URL=https://<your-backend-domain>
```

### 4. Deploy
Deploy the Vercel project.

---

## Production URLs
Make sure the backend uses the real frontend domain for payment redirects, e.g.: 
- `FRONTEND_URL=https://<your-vercel-url>`
- `BACKEND_URL=https://<your-backend-domain>`

This ensures:
- Stripe success/cancel redirect URL uses the deployed frontend
- PayPal return/cancel URLs use the deployed frontend
- media URLs from Django serializers use the deployed backend domain

---

## Quick verification checklist

1. Open the frontend URL
2. Login/register works
3. Courses list loads
4. Course detail loads
5. Enrollment/payment flow works
6. Stripe checkout redirects to Stripe and returns to `/payment/success`
7. Razorpay fallback works if Stripe is unavailable
8. WebSocket notifications/chat connect if backend supports Channels

---

## Local development safeguards

Do not commit `.env` files. The repo ignores them.

`final/backend/.gitignore` already ignores:
- `.env`
- `venv/`
- `db.sqlite3`

`final/frontend/.gitignore` already ignores:
- `.env`
- `node_modules/`
- `dist/`

---

## Render backend deployment (recommended)

### 1. Create the Render service
- Sign in to Render.
- Create a new **Web Service**.
- Connect your GitHub/GitLab repo.
- Choose the branch you want to deploy (`main` or `Week20`).
- Set the root directory to: `final/backend`

### 2. Build and start commands
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
daphne -b 0.0.0.0 -p $PORT learning_platform_backend.asgi:application
```

### 3. Environment variables
Add the required environment variables in Render:

```text
DEBUG=False
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=<your-backend-domain>
CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
CSRF_TRUSTED_ORIGINS=https://<your-frontend-domain>
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
DATABASE_URL=<your-database-url>
REDIS_URL=<your-redis-url>  # needed only if using Channels websockets
ELASTICSEARCH_URL=<your-elasticsearch-url>  # if using Elasticsearch
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
PAYPAL_CLIENT_ID=<paypal-client-id>  # optional
PAYPAL_CLIENT_SECRET=<paypal-client-secret>  # optional
FRONTEND_URL=https://<your-frontend-domain>
BACKEND_URL=https://<your-backend-domain>
```

### 4. Deploy and run migrations
- Deploy the service.
- Open the Render dashboard shell or use Render deploy commands to run:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### 5. Stripe webhook registration
Register the Stripe webhook endpoint with:

```text
https://<your-backend-domain>/api/payments/webhook/
```

Use the `STRIPE_WEBHOOK_SECRET` value from Stripe.

### 6. Redis / Channels support
If you use WebSocket notifications or chat:
- Enable a Redis instance on Render or another provider.
- Set `REDIS_URL` in Render.
- Confirm Channels is using that URL.

---

## Vercel frontend deployment

### 1. Create the Vercel project
- Sign in to Vercel.
- Click **New Project**.
- Import your repo.
- Set the root directory to: `final/frontend`

### 2. Set build settings
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### 3. Set production environment variable
In Vercel project settings, add:

```text
VITE_API_URL=https://<your-backend-domain>
```

If you have preview branches, set the same variable for Preview and Production.

### 4. Deploy
- Deploy the Vercel project.
- Wait for the build to finish.
- Use the Vercel generated domain or your custom domain.

### 5. Verify frontend/backend integration
After deployment:
- Open the Vercel URL.
- Confirm API calls go to your backend domain.
- Confirm `/payment/success` and course enrollments work.

---

## Example field values

### Render Web Service
- Name: `lumina-backend`
- Root: `final/backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `daphne -b 0.0.0.0 -p $PORT learning_platform_backend.asgi:application`
- Environment: production vars above

### Vercel Project
- Root Directory: `final/frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable: `VITE_API_URL=https://lumina-backend.onrender.com`

---

## Final notes
- Keep `.env` out of Git.
- Use HTTPS for both frontend and backend.
- Ensure `FRONTEND_URL` is the Vercel URL and `BACKEND_URL` is the Render domain.
- Re-deploy whenever you update code in `final/backend` or `final/frontend`.

---

## Summary
- Backend → Render
- Frontend → Vercel
- Use `VITE_API_URL` for frontend API base URL
- Use `FRONTEND_URL` for payment redirects and backend-generated links
- Keep secrets in Render/Vercel environment settings only
