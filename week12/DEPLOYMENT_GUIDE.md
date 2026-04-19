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
9. **Start Command**: `gunicorn ecommerce_backend.wsgi`
10. Click **Advanced** and add these Environment Variables:
    - `SECRET_KEY`: (Generate a random string)
    - `DEBUG`: `False`
    - `DATABASE_URL`: (Paste your Internal Database URL from Step 2)
    - `ALLOWED_HOSTS`: `*.onrender.com`
11. Click **Create Web Service**.

## 4. Run Migrations
Since we are using a fresh PostgreSQL database, you need to run migrations.
1. Go to the **Shell** tab of your Web Service on Render.
2. Run: `python manage.py migrate`
3. (Optional) Create a superuser: `python manage.py createsuperuser`

## 5. Verify
1. Visit your Render URL (found at the top of the service page).
2. Append `/api/products/` to your URL.
3. You should see an empty list (or your API response).

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
