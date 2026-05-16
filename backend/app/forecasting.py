from __future__ import annotations

from typing import List

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_percentage_error
from sqlalchemy.orm import Session

from .models import ForecastResult, SalesRecord


REQUIRED_COLUMNS = {"date", "product", "quantity", "sales"}


def normalize_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    df = df.copy()
    df.columns = [str(column).strip().lower() for column in df.columns]
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")

    before_rows = len(df)
    df = df[list(REQUIRED_COLUMNS)]
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["product"] = df["product"].astype(str).str.strip()
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
    df["sales"] = pd.to_numeric(df["sales"], errors="coerce")
    df = df.dropna(subset=["date", "product"])
    df[["quantity", "sales"]] = df[["quantity", "sales"]].fillna(0)
    df = df[df["product"] != ""]
    df = df.drop_duplicates(subset=["date", "product"])
    df = df.sort_values("date")

    stats = {
        "original_rows": before_rows,
        "clean_rows": len(df),
        "removed_rows": before_rows - len(df),
    }
    return df, stats


def train_and_forecast(db: Session, dataset_id: int, periods: int = 6) -> List[ForecastResult]:
    rows = db.query(SalesRecord).filter(SalesRecord.dataset_id == dataset_id).all()
    if not rows:
        return []

    df = pd.DataFrame(
        [
            {"date": row.date, "product": row.product, "quantity": row.quantity}
            for row in rows
        ]
    )
    df["date"] = pd.to_datetime(df["date"])
    outputs: List[ForecastResult] = []
    db.query(ForecastResult).filter(ForecastResult.dataset_id == dataset_id).delete()

    for product, product_df in df.groupby("product"):
        monthly = (
            product_df.set_index("date")["quantity"]
            .resample("MS")
            .sum()
            .reset_index()
            .sort_values("date")
        )
        monthly["step"] = range(len(monthly))

        if len(monthly) >= 3:
            split_at = max(2, int(len(monthly) * 0.8))
            train = monthly.iloc[:split_at]
            test = monthly.iloc[split_at:]
            model = LinearRegression()
            model.fit(train[["step"]], train["quantity"])
            if len(test):
                predictions = model.predict(test[["step"]])
                mape = mean_absolute_percentage_error(test["quantity"].replace(0, 1), predictions)
                accuracy = max(0, min(100, 100 - (mape * 100)))
            else:
                accuracy = 100
            model.fit(monthly[["step"]], monthly["quantity"])
        else:
            model = None
            accuracy = 75

        last_date = monthly["date"].max().date()
        for index in range(1, periods + 1):
            forecast_date = (pd.Timestamp(last_date) + pd.DateOffset(months=index)).date()
            if model:
                predicted = float(model.predict([[len(monthly) + index - 1]])[0])
            else:
                predicted = float(monthly["quantity"].mean())
            result = ForecastResult(
                dataset_id=dataset_id,
                product=product,
                forecast_date=forecast_date,
                predicted_demand=max(0, round(predicted, 2)),
                accuracy=round(float(accuracy), 2),
            )
            db.add(result)
            outputs.append(result)

    db.commit()
    for output in outputs:
        db.refresh(output)
    return outputs