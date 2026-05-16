from __future__ import annotations
from datetime import date, datetime
from typing import Dict, List

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class DatasetOut(BaseModel):
    id: int
    name: str
    row_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ForecastPoint(BaseModel):
    date: date
    product: str
    predicted_demand: float
    accuracy: float


class AnalyticsOut(BaseModel):
    total_sales: float
    monthly_sales: List[Dict]
    top_products: List[Dict]
    forecast_accuracy: float
    forecast: List[ForecastPoint]