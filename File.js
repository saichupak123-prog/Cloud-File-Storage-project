const express = require('express');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET_NAME;

// Middleware: block anyone who isn't logged in from using these routes.
function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please log in first.' });
  }
  next();
}
router.use(requireLogin);

// Every file a user owns is stored under "<userId>/<filename>" in the
// bucket. This is how one bucket safely serves many users.
function keyFor(userId, filename) {
  return `${userId}/${filename}`;
}

// 1) Ask for a presigned UPLOAD url.
// Frontend calls this first, then PUTs the file directly to the URL we return.
router.post('/upload-url', async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename is required' });

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: keyFor(req.user.id, filename),
    ContentType: contentType || 'application/octet-stream',
  });

  // expiresIn is in seconds — 300 = 5 minutes to actually perform the upload.
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  res.json({ uploadUrl });
});

// 2) List all of this user's files (latest version of each).
router.get('/', async (req, res) => {
  const prefix = `${req.user.id}/`;
  const command = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix });
  const result = await s3.send(command);

  const files = (result.Contents || []).map((obj) => ({
    key: obj.Key,
    name: obj.Key.replace(prefix, ''),
    size: obj.Size,
    lastModified: obj.LastModified,
  }));

  res.json({ files });
});

// 3) Ask for a presigned DOWNLOAD url for one file.
// This same URL is what you use as the "share link" — anyone with the
// link can download the file until it expires.
router.get('/:filename/download-url', async (req, res) => {
  const key = keyFor(req.user.id, req.params.filename);
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

  // 3600 seconds = 1 hour. Make this shorter/longer depending on how
  // long a "share link" should stay valid.
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  res.json({ downloadUrl });
});

// 4) List every past version of a file (requires bucket versioning ON).
router.get('/:filename/versions', async (req, res) => {
  const key = keyFor(req.user.id, req.params.filename);
  const command = new ListObjectVersionsCommand({ Bucket: BUCKET, Prefix: key });
  const result = await s3.send(command);

  const versions = (result.Versions || [])
    .filter((v) => v.Key === key)
    .map((v) => ({
      versionId: v.VersionId,
      lastModified: v.LastModified,
      isLatest: v.IsLatest,
      size: v.Size,
    }));

  res.json({ versions });
});

module.exports = router;
