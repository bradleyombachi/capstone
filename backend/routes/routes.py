from fastapi import APIRouter, Depends, HTTPException


router = APIRouter()

@router.get("/")
async def test():
    return {"brickName": "Damn"}