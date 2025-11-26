import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import joblib
from prophet import Prophet


def generate_sample_data():
    print("Generating sample training data...")
    
    start_date = datetime.now() - timedelta(days=365)
    dates = pd.date_range(start=start_date, end=datetime.now(), freq='D')
    
    np.random.seed(42)
    
    base_demand = 50
    
    seasonal_component = 10 * np.sin(2 * np.pi * np.arange(len(dates)) / 365)
    
    weekly_component = 5 * np.sin(2 * np.pi * np.arange(len(dates)) / 7)
    
    trend = np.linspace(0, 10, len(dates))
    
    noise = np.random.normal(0, 5, len(dates))
    
    demand = base_demand + seasonal_component + weekly_component + trend + noise
    demand = np.maximum(demand, 0)
    
    df = pd.DataFrame({
        'ds': dates,
        'y': demand
    })
    
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
    ]
    
    df['is_holiday'] = df['ds'].apply(lambda x: 1 if x.date() in [h.date() for h in holidays_dates] else 0)
    
    for i, row in df.iterrows():
        if row['is_holiday']:
            df.at[i, 'y'] = row['y'] * 1.5
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/sample_sales_data.csv', index=False)
    print(f"Sample data saved: {len(df)} rows")
    
    return df


def train_prophet_model(df):
    print("\nTraining Prophet model...")
    
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True,
        seasonality_mode='multiplicative',
        changepoint_prior_scale=0.05
    )
    
    if 'is_holiday' in df.columns:
        model.add_regressor('is_holiday')
    
    model.fit(df[['ds', 'y', 'is_holiday']])
    
    os.makedirs('models', exist_ok=True)
    
    import pickle
    with open('models/demand_forecast_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Prophet model trained and saved to models/demand_forecast_model.pkl")
    
    return model


def evaluate_model(model, df):
    print("\nEvaluating model...")
    
    future = model.make_future_dataframe(periods=30)
    future['is_holiday'] = 0
    forecast = model.predict(future)
    
    train_size = int(len(df) * 0.8)
    train_df = df[:train_size]
    test_df = df[train_size:]
    
    test_forecast = forecast[forecast['ds'].isin(test_df['ds'])]
    
    if len(test_forecast) > 0:
        actual = test_df['y'].values
        predicted = test_forecast['yhat'].values[:len(actual)]
        
        mae = np.mean(np.abs(actual - predicted))
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100
        
        print(f"\nModel Performance Metrics:")
        print(f"  Mean Absolute Error (MAE): {mae:.2f}")
        print(f"  Root Mean Squared Error (RMSE): {rmse:.2f}")
        print(f"  Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
    else:
        print("Not enough test data for evaluation")
    
    print(f"\nForecast summary (next 30 days):")
    future_forecast = forecast[forecast['ds'] > df['ds'].max()]
    print(f"  Average predicted demand: {future_forecast['yhat'].mean():.2f}")
    print(f"  Min predicted demand: {future_forecast['yhat'].min():.2f}")
    print(f"  Max predicted demand: {future_forecast['yhat'].max():.2f}")


def train_models():
    print("=" * 60)
    print("Retail Inventory & Pricing Assistant - Model Training")
    print("=" * 60)
    
    df = generate_sample_data()
    
    model = train_prophet_model(df)
    
    evaluate_model(model, df)
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print("=" * 60)
    print("\nTrained models:")
    print("  - models/demand_forecast_model.pkl (Prophet time-series model)")
    print("\nSample data:")
    print("  - data/sample_sales_data.csv")
    print("\nYou can now use these models for demand forecasting in the API.")


if __name__ == "__main__":
    train_models()
