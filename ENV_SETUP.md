# Frontend Environment Setup

Local development:
1. Copy .env.local.example -> .env.local (or create .env.local)
2. Set `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. `npm run dev`

Production (Render):
1. Set environment variable `NEXT_PUBLIC_API_URL` to your deployed backend URL  
   e.g. `https://streakfitx-backend.onrender.com`
2. Deploy the frontend – Next.js will bake this value at build time.


