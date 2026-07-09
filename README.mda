Cloud-Based File Storage System
A simple secure cloud storage app (like a mini Google Drive) built with Node.js/Express, AWS S3, and Google OAuth.

Features
Sign in with Google (OAuth 2.0)
Upload files directly to S3 (browser -> S3, backend never touches file bytes)
List your own files
Share a file via a time-limited link (presigned URL)
Automatic file versioning (via S3 bucket versioning)
Architecture
Browser --(Google login)--> Backend (Express + Passport)
Browser --(PUT file)------> AWS S3 (using a presigned URL from backend)
Browser --(GET file)------> AWS S3 (using a presigned URL, this is also the "share link")
Setup
1. AWS
Create an S3 bucket, e.g. my-cloud-drive-yourname.
In the bucket's Properties tab, enable Bucket Versioning.
In IAM, create a user with an inline policy allowing s3:PutObject, s3:GetObject, s3:ListBucket, s3:GetObjectVersion scoped to that bucket. Save the Access Key ID and Secret Access Key.
2. Google OAuth
Go to Google Cloud Console -> APIs & Services -> Credentials.
Create an OAuth 2.0 Client ID (type: Web application).
Add http://localhost:5000/auth/google/callback as an authorized redirect URI.
Save the Client ID and Client Secret.
3. Project setup
npm install
cp .env.example .env
# then fill in .env with your AWS + Google credentials
npm run dev
Visit http://localhost:5000

Deploying
Backend: Render, Railway, or Fly.io (all have free tiers) — or EC2 if you want the practice. Just update GOOGLE_CALLBACK_URL and CLIENT_URL to your deployed domain, and add that callback URL in Google Cloud Console too.
No separate frontend deploy needed — Express serves the public/ folder.
Notes for submission
Push this repo to GitHub with this README.
Take screenshots of: login screen, file upload, file list, and a generated share link.
Post a short writeup on LinkedIn with the repo link.
