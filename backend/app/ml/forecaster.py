import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import joblib
import os
from prophet import Prophet
from sklearn.ensemble import RandomForestRegressor


class DemandForecaster:
    def __init__(self, model_path: str = "../ml_module/models"):
        self.model_path = model_path
        self.prophet_model = None
        self.rf_model = None
    
    def prepare_data(
        self,
        sales_data: List[Dict],
        events: Optional[List[Dict]] = None
    ) -> pd.DataFrame:
        if not sales_data:
            return pd.DataFrame()
        
        df_list = []
        for sale in sales_data:
            for item in sale.get("items", []):
                df_list.append({
                    "ds": sale["sale_date"],
                    "y": item["quantity"],
                    "product_id": item["product_id"],
                    "product_name": item["product_name"],
                    "price": item["unit_price"]
                })
        
        if not df_list:
            return pd.DataFrame()
        
        df = pd.DataFrame(df_list)
        df["ds"] = pd.to_datetime(df["ds"])
        
        if events:
            events_df = pd.DataFrame(events)
            events_df["date"] = pd.to_datetime(events_df["date"])
            df = df.merge(
                events_df[["date", "impact_level"]],
                left_on="ds",
                right_on="date",
                how="left"
            )
            df["is_event"] = df["impact_level"].notna().astype(int)
            df = df.drop(columns=["date", "impact_level"], errors="ignore")
        else:
            df["is_event"] = 0
        
        return df
    
    def forecast_product_demand(
        self,
        product_id: str,
        sales_data: List[Dict],
        forecast_days: int = 30,
        events: Optional[List[Dict]] = None
    ) -> Dict:
        df = self.prepare_data(sales_data, events)
        
        if df.empty:
            return {
                "product_id": product_id,
                "forecast": [],
                "confidence": "low",
                "message": "Insufficient data for forecasting"
            }
        
        product_df = df[df["product_id"] == product_id].copy()
        
        if len(product_df) < 10:
            return {
                "product_id": product_id,
                "forecast": [],
                "confidence": "low",
                "message": "Insufficient sales history for this product"
            }
        
        daily_sales = product_df.groupby("ds").agg({
            "y": "sum",
            "is_event": "max"
        }).reset_index()
        
        try:
            model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True,
                changepoint_prior_scale=0.05
            )
            
            if "is_event" in daily_sales.columns:
                model.add_regressor("is_event")
            
            model.fit(daily_sales[["ds", "y", "is_event"]])
            
            future = model.make_future_dataframe(periods=forecast_days)
            future["is_event"] = 0
            
            if events:
                future_events = [
                    e for e in events
                    if datetime.fromisoformat(str(e["date"])) > datetime.utcnow()
                ]
                for event in future_events:
                    event_date = pd.to_datetime(event["date"])
                    future.loc[future["ds"] == event_date, "is_event"] = 1
            
            forecast = model.predict(future)
            
            future_forecast = forecast[forecast["ds"] > datetime.utcnow()].copy()
            
            forecast_list = []
            for _, row in future_forecast.iterrows():
                forecast_list.append({
                    "date": row["ds"].strftime("%Y-%m-%d"),
                    "predicted_demand": max(0, round(row["yhat"], 2)),
                    "lower_bound": max(0, round(row["yhat_lower"], 2)),
                    "upper_bound": max(0, round(row["yhat_upper"], 2))
                })
            
            total_predicted = sum(f["predicted_demand"] for f in forecast_list)
            confidence = "high" if len(product_df) >= 50 else "medium"
            
            return {
                "product_id": product_id,
                "forecast": forecast_list,
                "total_predicted_demand": round(total_predicted, 2),
                "confidence": confidence,
                "historical_average": round(daily_sales["y"].mean(), 2),
                "message": "Forecast generated successfully"
            }
        
        except Exception as e:
            avg_demand = daily_sales["y"].mean()
            simple_forecast = [
                {
                    "date": (datetime.utcnow() + timedelta(days=i)).strftime("%Y-%m-%d"),
                    "predicted_demand": round(avg_demand, 2),
                    "lower_bound": round(avg_demand * 0.7, 2),
                    "upper_bound": round(avg_demand * 1.3, 2)
                }
                for i in range(1, forecast_days + 1)
            ]
            
            return {
                "product_id": product_id,
                "forecast": simple_forecast,
                "total_predicted_demand": round(avg_demand * forecast_days, 2),
                "confidence": "low",
                "historical_average": round(avg_demand, 2),
                "message": f"Using simple average-based forecast: {str(e)}"
            }
    
    def calculate_reorder_point(
        self,
        forecast_data: Dict,
        lead_time_days: int = 7,
        service_level: float = 0.95
    ) -> Dict:
        if not forecast_data.get("forecast"):
            return {
                "reorder_point": 0,
                "safety_stock": 0,
                "message": "Insufficient data"
            }
        
        lead_time_forecast = forecast_data["forecast"][:lead_time_days]
        lead_time_demand = sum(f["predicted_demand"] for f in lead_time_forecast)
        
        demand_values = [f["predicted_demand"] for f in lead_time_forecast]
        demand_std = np.std(demand_values) if len(demand_values) > 1 else lead_time_demand * 0.2
        
        z_score = 1.65 if service_level >= 0.95 else 1.28
        safety_stock = z_score * demand_std * np.sqrt(lead_time_days)
        
        reorder_point = lead_time_demand + safety_stock
        
        return {
            "reorder_point": max(1, round(reorder_point)),
            "safety_stock": max(0, round(safety_stock)),
            "lead_time_demand": round(lead_time_demand, 2),
            "lead_time_days": lead_time_days,
            "service_level": service_level,
            "message": "Reorder point calculated successfully"
        }
    
    def optimize_pricing(
        self,
        product_data: Dict,
        sales_data: List[Dict],
        market_data: Optional[Dict] = None
    ) -> Dict:
        cost_price = product_data.get("cost_price", 0)
        current_price = product_data.get("selling_price", 0)
        
        if cost_price == 0:
            return {
                "recommended_price": current_price,
                "min_price": current_price,
                "max_price": current_price,
                "message": "Cost price not available"
            }
        
        min_markup = 1.15
        target_markup = 1.40
        max_markup = 2.00
        
        min_price = cost_price * min_markup
        recommended_price = cost_price * target_markup
        max_price = cost_price * max_markup
        
        product_id = product_data.get("_id") or product_data.get("id")
        if product_id and sales_data:
            df = self.prepare_data(sales_data)
            product_sales = df[df["product_id"] == str(product_id)]
            
            if not product_sales.empty:
                avg_quantity = product_sales["y"].mean()
                price_elasticity = -1.5
                
                if avg_quantity < 5:
                    recommended_price *= 0.95
                elif avg_quantity > 20:
                    recommended_price *= 1.05
        
        if market_data and market_data.get("competitor_prices"):
            competitor_avg = np.mean(market_data["competitor_prices"])
            if competitor_avg > 0:
                recommended_price = min(recommended_price, competitor_avg * 0.98)
        
        recommended_price = max(min_price, min(recommended_price, max_price))
        
        expected_margin = ((recommended_price - cost_price) / recommended_price) * 100
        
        return {
            "recommended_price": round(recommended_price, 2),
            "min_price": round(min_price, 2),
            "max_price": round(max_price, 2),
            "current_price": current_price,
            "expected_margin_percent": round(expected_margin, 2),
            "price_change_percent": round(
                ((recommended_price - current_price) / current_price) * 100, 2
            ) if current_price > 0 else 0,
            "message": "Pricing optimized based on cost and demand"
        }
