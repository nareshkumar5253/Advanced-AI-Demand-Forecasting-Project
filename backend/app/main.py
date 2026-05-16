from io import BytesIO
from typing import List

import pandas as pd
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, verify_password
from .database import Base, engine, get_db
from .forecasting import normalize_dataset, train_and_forecast
from .models import Dataset, ForecastResult, SalesRecord, User
from .schemas import AnalyticsOut, DatasetOut, Token, UserCreate, UserLogin, UserOut


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Advanced AI Demand Forecasting API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name, email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user.email), "user": user}


@app.post("/api/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token(user.email), "user": user}


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/datasets", response_model=List[DatasetOut])
def list_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Dataset)
        .filter(Dataset.owner_id == current_user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )


@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        if file.filename.lower().endswith(".csv"):
            df = pd.read_csv(BytesIO(content))
        elif file.filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(BytesIO(content))
        else:
            raise ValueError("Only CSV and Excel files are supported")
        clean_df, stats = normalize_dataset(df)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    dataset = Dataset(name=file.filename, row_count=len(clean_df), owner_id=current_user.id)
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    records = [
        SalesRecord(
            dataset_id=dataset.id,
            date=row.date.date(),
            product=row.product,
            quantity=float(row.quantity),
            sales=float(row.sales),
        )
        for row in clean_df.itertuples(index=False)
    ]
    db.bulk_save_objects(records)
    db.commit()
    return {"dataset": DatasetOut.model_validate(dataset), "validation": stats}


def get_user_dataset(dataset_id: int, current_user: User, db: Session) -> Dataset:
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == current_user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@app.post("/api/forecast/{dataset_id}")
def forecast(
    dataset_id: int,
    periods: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_dataset(dataset_id, current_user, db)
    results = train_and_forecast(db, dataset_id, min(max(periods, 1), 24))
    return {
        "items": [
            {
                "date": item.forecast_date,
                "product": item.product,
                "predicted_demand": item.predicted_demand,
                "accuracy": item.accuracy,
            }
            for item in results
        ]
    }


@app.get("/api/analytics/{dataset_id}", response_model=AnalyticsOut)
def analytics(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_dataset(dataset_id, current_user, db)
    records = db.query(SalesRecord).filter(SalesRecord.dataset_id == dataset_id).all()
    forecasts = db.query(ForecastResult).filter(ForecastResult.dataset_id == dataset_id).all()
    df = pd.DataFrame(
        [{"date": row.date, "product": row.product, "quantity": row.quantity, "sales": row.sales} for row in records]
    )
    if df.empty:
        return {"total_sales": 0, "monthly_sales": [], "top_products": [], "forecast_accuracy": 0, "forecast": []}
    df["date"] = pd.to_datetime(df["date"])
    monthly = (
        df.set_index("date")["sales"]
        .resample("MS")
        .sum()
        .reset_index()
        .assign(month=lambda frame: frame["date"].dt.strftime("%b %Y"))
    )
    top_products = (
        df.groupby("product", as_index=False)["sales"]
        .sum()
        .sort_values("sales", ascending=False)
        .head(5)
        .to_dict("records")
    )
    accuracy = round(sum(item.accuracy for item in forecasts) / len(forecasts), 2) if forecasts else 0
    return {
        "total_sales": round(float(df["sales"].sum()), 2),
        "monthly_sales": monthly[["month", "sales"]].to_dict("records"),
        "top_products": top_products,
        "forecast_accuracy": accuracy,
        "forecast": [
            {
                "date": item.forecast_date,
                "product": item.product,
                "predicted_demand": item.predicted_demand,
                "accuracy": item.accuracy,
            }
            for item in forecasts
        ],
    }


@app.get("/api/reports/{dataset_id}/excel")
def export_excel(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = get_user_dataset(dataset_id, current_user, db)
    records = db.query(SalesRecord).filter(SalesRecord.dataset_id == dataset_id).all()
    forecasts = db.query(ForecastResult).filter(ForecastResult.dataset_id == dataset_id).all()
    output = BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        pd.DataFrame([{"date": r.date, "product": r.product, "quantity": r.quantity, "sales": r.sales} for r in records]).to_excel(writer, sheet_name="Historical Sales", index=False)
        pd.DataFrame([{"date": f.forecast_date, "product": f.product, "predicted_demand": f.predicted_demand, "accuracy": f.accuracy} for f in forecasts]).to_excel(writer, sheet_name="Forecast", index=False)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={dataset.name}-report.xlsx"},
    )


@app.get("/api/reports/{dataset_id}/pdf")
def export_pdf(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = get_user_dataset(dataset_id, current_user, db)
    forecasts = db.query(ForecastResult).filter(ForecastResult.dataset_id == dataset_id).limit(20).all()
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=letter)
    pdf.setTitle("Demand Forecast Report")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(72, 735, "Demand Forecast Report")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(72, 710, f"Dataset: {dataset.name}")
    pdf.drawString(72, 690, f"Rows analyzed: {dataset.row_count}")
    y = 650
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(72, y, "Date")
    pdf.drawString(165, y, "Product")
    pdf.drawString(360, y, "Predicted Demand")
    pdf.drawString(475, y, "Accuracy")
    pdf.setFont("Helvetica", 10)
    for item in forecasts:
        y -= 22
        if y < 72:
            pdf.showPage()
            y = 735
        pdf.drawString(72, y, str(item.forecast_date))
        pdf.drawString(165, y, item.product[:28])
        pdf.drawString(360, y, f"{item.predicted_demand:.2f}")
        pdf.drawString(475, y, f"{item.accuracy:.1f}%")
    pdf.save()
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={dataset.name}-report.pdf"},
    )