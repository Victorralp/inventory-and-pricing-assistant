import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pickle
import os


def load_model(model_path='models/demand_forecast_model.pkl'):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please run train.py first.")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    return model


def predict_demand(days_ahead=30, include_holidays=True):
    print("Loading trained model...")
    model = load_model()
    
    print(f"Generating forecast for next {days_ahead} days...")
    
    future = model.make_future_dataframe(periods=days_ahead)
    
    future['is_holiday'] = 0
    
    if include_holidays:
        holidays_dates = [
            datetime(2024, 1, 1),
            datetime(2024, 4, 19),
            datetime(2024, 4, 22),
            datetime(2024, 5, 1),
            datetime(2024, 5, 27),
            datetime(2024, 6, 12),
            datetime(2024, 10, 1),
            datetime(2024, 12, 25),
            datetime(2024, 12, 26),
            datetime(2025, 1, 1),
            datetime(2025, 4, 19),
            datetime(2025, 4, 22),
            datetime(2025, 5, 1),
        ]
        
        future['is_holiday'] = future['ds'].apply(
            lambda x: 1 if x.date() in [h.date() for h in holidays_dates] else 0
        )
    
    forecast = model.predict(future)
    
    future_forecast = forecast[forecast['ds'] > datetime.now()]
    
    print("\nForecast Results:")
    print("=" * 60)
    print(f"{'Date':<12} {'Predicted':<12} {'Lower':<12} {'Upper':<12}")
    print("=" * 60)
    
    for _, row in future_forecast.head(10).iterrows():
        print(f"{row['ds'].strftime('%Y-%m-%d'):<12} "
              f"{row['yhat']:>11.2f} "
              f"{row['yhat_lower']:>11.2f} "
              f"{row['yhat_upper']:>11.2f}")
    
    if len(future_forecast) > 10:
        print(f"... and {len(future_forecast) - 10} more days")
    
    print("\nSummary Statistics:")
    print(f"  Average daily demand: {future_forecast['yhat'].mean():.2f}")
    print(f"  Total forecasted demand: {future_forecast['yhat'].sum():.2f}")
    print(f"  Peak demand: {future_forecast['yhat'].max():.2f} on {future_forecast.loc[future_forecast['yhat'].idxmax(), 'ds'].strftime('%Y-%m-%d')}")
    print(f"  Lowest demand: {future_forecast['yhat'].min():.2f} on {future_forecast.loc[future_forecast['yhat'].idxmin(), 'ds'].strftime('%Y-%m-%d')}")
    
    return future_forecast


def calculate_reorder_point(forecast_df, lead_time_days=7, service_level=0.95):
    print(f"\nCalculating reorder point (Lead time: {lead_time_days} days, Service level: {service_level*100}%)...")
    
    lead_time_forecast = forecast_df.head(lead_time_days)
    lead_time_demand = lead_time_forecast['yhat'].sum()
    
    demand_std = lead_time_forecast['yhat'].std()
    
    z_score = 1.65 if service_level >= 0.95 else 1.28
    safety_stock = z_score * demand_std * np.sqrt(lead_time_days)
    
    reorder_point = lead_time_demand + safety_stock
    
    print(f"\nReorder Point Calculation:")
    print(f"  Lead time demand: {lead_time_demand:.2f}")
    print(f"  Safety stock: {safety_stock:.2f}")
    print(f"  Reorder point: {reorder_point:.2f}")
    
    return {
        'reorder_point': reorder_point,
        'safety_stock': safety_stock,
        'lead_time_demand': lead_time_demand
    }


if __name__ == "__main__":
    print("=" * 60)
    print("Retail Inventory Assistant - Demand Prediction")
    print("=" * 60 + "\n")
    
    forecast = predict_demand(days_ahead=30)
    
    reorder_info = calculate_reorder_point(forecast)
    
    print("\n" + "=" * 60)
    print("Prediction completed successfully!")
    print("=" * 60)
