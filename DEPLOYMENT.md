# Deploying the frontend and backend

The API uses the `CLIENT_URL` environment variable to decide which browser
origins may call it. Set `CLIENT_URL` in the Render service's Environment
settings to the deployed Vercel frontend origin, including its scheme and host
but no path. For example:

```text
CLIENT_URL=https://your-shop.vercel.app
```

For more than one frontend (for example, production and a stable preview
deployment), use a comma-separated list of exact origins:

```text
CLIENT_URL=https://your-shop.vercel.app,https://your-preview.vercel.app
```

Do not use `*` or include a URL path. Each configured origin must match the
frontend's browser origin exactly. Production startup fails if `CLIENT_URL` is
missing or invalid when `NODE_ENV=production`. Set `NODE_ENV=production` in
Render. In development, the origin defaults to `http://localhost:5173`.

In Vercel, set the frontend's backend API URL environment variable to the
Render service URL (for example, `https://your-api.onrender.com`), then redeploy
the frontend. Set the backend's other required secrets in Render as well:
`MONGO_URI` and `JWT_SECRET`. Render provides the `PORT` environment variable
for the API process.

## Local development

Copy `.env.example` to `.env`, add your MongoDB connection string and a strong
JWT secret, then run:

```sh
npm install
npm run dev
```
