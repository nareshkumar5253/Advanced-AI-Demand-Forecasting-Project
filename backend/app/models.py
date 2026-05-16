from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    datasets: Mapped[List["Dataset"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped[User] = relationship(back_populates="datasets")
    records: Mapped[List["SalesRecord"]] = relationship(back_populates="dataset", cascade="all, delete-orphan")
    forecasts: Mapped[List["ForecastResult"]] = relationship(back_populates="dataset", cascade="all, delete-orphan")


class SalesRecord(Base):
    __tablename__ = "sales_records"
    __table_args__ = (UniqueConstraint("dataset_id", "date", "product", name="uq_dataset_date_product"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"))
    date = mapped_column(Date)
    product: Mapped[str] = mapped_column(String(255), index=True)
    quantity: Mapped[float] = mapped_column(Float)
    sales: Mapped[float] = mapped_column(Float)

    dataset: Mapped[Dataset] = relationship(back_populates="records")


class ForecastResult(Base):
    __tablename__ = "forecast_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"))
    product: Mapped[str] = mapped_column(String(255), index=True)
    forecast_date = mapped_column(Date)
    predicted_demand: Mapped[float] = mapped_column(Float)
    accuracy: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dataset: Mapped[Dataset] = relationship(back_populates="forecasts")