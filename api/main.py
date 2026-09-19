from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2, os
app = FastAPI(title="Uber Ops API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/uber_ops")
def get_conn():
    return psycopg2.connect(DB_URL)
@app.get("/")
def health():
    return {"status": "Uber Ops API Live"}
@app.get("/api/kpi")
def kpi(date: str = "2014-09-15"):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("""SELECT COUNT(*), COALESCE(SUM(fare_amount),0), COALESCE(AVG(EXTRACT(EPOCH FROM (dropoff_datetime - pickup_datetime))/60),0), COALESCE(AVG(surge_multiplier),1), COALESCE(SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0),0) FROM uber_rides WHERE DATE(pickup_datetime)=%s""", (date,))
    r = cur.fetchone(); conn.close()
    return {"total_rides": r[0], "revenue": float(r[1]), "avg_eta": float(r[2]), "avg_surge": float(r[3]), "cancel_rate": float(r[4])}
@app.get("/api/surge-trend")
def surge_trend(date: str = "2014-09-15"):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.callproc('usp_GetSurgeAnalysis', [date]); rows = cur.fetchall()
    except:
        cur.execute("""SELECT EXTRACT(HOUR FROM pickup_datetime)::int, AVG(surge_multiplier), COUNT(*), AVG(fare_amount) FROM uber_rides WHERE DATE(pickup_datetime)=%s GROUP BY 1 ORDER BY 1""", (date,)); rows = cur.fetchall()
    conn.close()
    return [{"hour": f"{x[0]}:00", "avg_surge": float(x[1] or 1), "total_rides": x[2], "avg_fare": float(x[3] or 0)} for x in rows]
@app.get("/api/hotspots")
def hotspots(date: str = "2014-09-15"):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("""SELECT pickup_zone, COUNT(*) as rides, AVG(fare_amount) as avg_fare FROM uber_rides WHERE DATE(pickup_datetime)=%s GROUP BY 1 ORDER BY rides DESC LIMIT 10""", (date,))
    data = [{"zone": r[0], "rides": r[1], "avg_fare": float(r[2] or 0)} for r in cur.fetchall()]; conn.close(); return data
@app.get("/api/map-points")
def map_points(date: str = "2014-09-15", limit: int = 1500):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT pickup_lat, pickup_lng, surge_multiplier FROM uber_rides WHERE DATE(pickup_datetime)=%s LIMIT %s", (date, limit))
    data = [{"lat": r[0], "lng": r[1], "surge": float(r[2] or 1)} for r in cur.fetchall()]; conn.close(); return data
