# 🚀 Week 12: Deployment Guide (Render + PostgreSQL)

Follow these steps to deploy your E-commerce API to the cloud.

## 1. Prepare your Repository
1. Ensure all changes in the `week12` directory are committed and pushed to GitHub.
2. (Optional) Create a `.env` file locally based on `env.example` to test your production settings.

## 2. Setup PostgreSQL on Render
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **PostgreSQL**.
3. Name your database (e.g., `ecommerce-db`).
4. Select the **Free** tier.
5. Click **Create Database**.
6. Once created, copy the **Internal Database URL** (for connecting from Render services) or **External Database URL** (for local testing).

## 3. Setup Web Service on Render
1. Click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. **Name**: `ecommerce-api`.
4. **Environment**: `Python`.
5. **Region**: Same as your database.
6. **Branch**: `main` (or your work branch).
7. **Root Directory**: `week12` (IMPORTANT: Point this to the week12 folder).
8. **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
9. **Start Command**: `python manage.py migrate && gunicorn ecommerce_backend.wsgi` (NOTE: This runs migrations automatically on every deploy, which is required for the Free Tier since the Shell is unavailable).
10. Click **Advanced** and add these Environment Variables:
    - `SECRET_KEY`: (Generate a random string)
    - `DEBUG`: `False`
    - `DATABASE_URL`: (Paste your Internal Database URL from Step 2)
    - `ALLOWED_HOSTS`: `*.onrender.com`
11. Click **Create Web Service**.

## 4. Database Initialization
In the Render Free Tier, the **Shell** tab is unavailable. Your database will now be initialized automatically during startup because of the updated Start Command.

1. Check the **Logs** tab in Render.
2. You should see "Operations to perform: Apply all migrations" followed by a list of successful migrations.
3. Once the logs show "Listening at: http://0.0.0.0:10000", your app is ready.
4. (Optional) If you need to create a superuser, you can temporarily change your Start Command to `python manage.py createsuperuser --noinput` (using environment variables for username/email/password) or use a custom management command/seed script.

## 5. Verify Successful Deployment
1. Visit your Render URL (found at the top of the service page).
2. Append `/api/products/` to your URL.
3. You should see a JSON response with your seeded products.

### 📸 Proof of Deployment
Below are the screenshots of the live API working on Render:

![Product List Live](screenshots/Screenshot%202026-04-20%20111728.png)
*Figure 1: Live API response showing the product list.*

![Admin Dashboard Live](screenshots/Screenshot%202026-04-20%20111740.png)
*Figure 2: Django Admin dashboard on the production server.*

---

## 🎁 Bonus: AWS S3 Media Setup
If you want to persist images:
1. Create an **S3 Bucket** on AWS.
2. Create an **IAM User** with `AmazonS3FullAccess`.
3. Add these Env Vars to Render:
   - `USE_S3`: `True`
   - `AWS_ACCESS_KEY_ID`: `...`
   - `AWS_SECRET_ACCESS_KEY`: `...`
   - `AWS_STORAGE_BUCKET_NAME`: `...`
   - `AWS_S3_REGION_NAME`: `...`
