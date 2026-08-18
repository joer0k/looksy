from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .v1 import auth

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
@app.get('/')
async def root():
    return {'message': 'Hello from backend!'}


@app.get('/health')
async def health():
    return {'status': 'healthy'}

@app.get('/health/db')
async def db(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    value = result.scalar_one()

    return {'status': 'Healthy', 'database_response': value}
