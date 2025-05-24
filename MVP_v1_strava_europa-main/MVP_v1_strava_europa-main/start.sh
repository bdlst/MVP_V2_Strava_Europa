#!/bin/bash
# Démarre backend + frontend
echo "▶️ Backend sur http://localhost:8000"
cd backend && uvicorn main:app --reload &

echo "▶️ Frontend Expo sur http://localhost:19006"
cd ../frontend && npm start
