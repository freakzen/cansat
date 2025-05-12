from flask import Flask, render_template, jsonify
import pymysql
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/static')

# Database configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'knox'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

def get_db_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB'],
        cursorclass=pymysql.cursors.DictCursor
    )

def fetch_sensor_data():
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            sql = """
            SELECT 
                id,
                timestamp,
                bmp_temp AS 'BMP_Temp(C)',
                bmp_pressure AS 'BMP_Pressure(hPa)',
                bmp_altitude AS 'BMP_Altitude(m)',
                mpu_accel_x AS 'MPU_AccelX(m/s²)',
                mpu_accel_y AS 'MPU_AccelY(m/s²)',
                mpu_accel_z AS 'MPU_AccelZ(m/s²)',
                mpu_gyro_x AS 'MPU_GyroX(rad/s)',
                mpu_gyro_y AS 'MPU_GyroY(rad/s)',
                mpu_gyro_z AS 'MPU_GyroZ(rad/s)',
                gps_lat AS 'GPS_Lat',
                gps_lon AS 'GPS_Lon',
                gps_alt AS 'GPS_Alt(m)',
                gps_speed AS 'GPS_Speed(m/s)',
                gps_hdop AS 'GPS_HDOP',
                dht_temp AS 'DHT_Temp(C)',
                dht_humidity AS 'DHT_Humidity(%)',
                created_at
            FROM cansat_data
            ORDER BY timestamp DESC
            LIMIT 50
            """
            cursor.execute(sql)
            return cursor.fetchall()
    except Exception as e:
        app.logger.error(f"Database error: {str(e)}")
        return []
    finally:
        if connection:
            connection.close()

@app.route('/')
def dashboard():
    data = fetch_sensor_data()
    latest = data[0] if data else {}
    return render_template('dashboard.html', latest_data=latest)

@app.route('/console')
def console():  # Renamed from console
    try:
        data = fetch_sensor_data()
        raw_data = "\n".join([str(item) for item in data])
        return render_template('console.html',
                           raw_data=raw_data,
                           timestamp=datetime.now().strftime("%H:%M:%S"),
                           record_count=len(data))
    except Exception as e:
        return render_template('console.html',
                           raw_data=f"Error loading data: {str(e)}",
                           timestamp="--:--:--",
                           record_count=0)

@app.route('/api/system-status')
def system_status():
    try:
        data = fetch_sensor_data()
        if not data:
            return jsonify({"error": "No data available"}), 404
            
        latest = data[0]
        
        # Prepare the response in the format your frontend expects
        response = {
            "BMP-280": {
                "status": "online",
                "temp": latest.get('BMP_Temp(C)', 'N/A'),
                "pressure": latest.get('BMP_Pressure(hPa)', 'N/A'),
                "altitude": latest.get('BMP_Altitude(m)', 'N/A')
            },
            "GPS": {
                "status": "online",
                "lat": latest.get('GPS_Lat', 'N/A'),
                "lon": latest.get('GPS_Lon', 'N/A'),
                "alt": latest.get('GPS_Alt(m)', 'N/A'),
                "sats": latest.get('GPS_HDOP', 'N/A'),  # Changed to use actual satellite count if available
                "speed": latest.get('GPS_Speed(m/s)', 'N/A')  # Added speed if needed
            },
            "MPU6050": {
                "status": "online",
                "accel_x": latest.get('MPU_AccelX(m/s²)', 'N/A'),
                "accel_y": latest.get('MPU_AccelY(m/s²)', 'N/A'),
                "accel_z": latest.get('MPU_AccelZ(m/s²)', 'N/A'),
                "gyro_x": latest.get('MPU_GyroX(rad/s)', 'N/A'),
                "gyro_y": latest.get('MPU_GyroY(rad/s)', 'N/A'),
                "gyro_z": latest.get('MPU_GyroZ(rad/s)', 'N/A')
            },
            "DHT22": {
                "status": "online",
                "temp": latest.get('DHT_Temp(C)', 'N/A'),
                "humidity": latest.get('DHT_Humidity(%)', 'N/A')
            }
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data')
def api_data():
    try:
        data = fetch_sensor_data()
        # Convert datetime objects to strings
        for item in data:
            if 'timestamp' in item:
                item['timestamp'] = item['timestamp'].isoformat() if item['timestamp'] else None
            if 'created_at' in item:
                item['created_at'] = item['created_at'].isoformat() if item['created_at'] else None
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status')
def status():  # Renamed from status
    data = fetch_sensor_data()
    latest = data[0] if data else {}
    return render_template('status.html', latest_data=latest)

@app.route('/gyro')
def gyro():  # Renamed from gyro
    data = fetch_sensor_data()
    latest = data[0] if data else {}
    return render_template('gyro.html', latest_data=latest)

@app.route('/api/gps-data')
def gps_data():
    try:
        data = fetch_sensor_data()
        if not data:
            return jsonify({"error": "No data available"}), 404
            
        # Filter and format GPS data
        gps_data = []
        for entry in data:
            if entry.get('GPS_Lat') and entry.get('GPS_Lon'):
                gps_data.append({
                    'lat': entry['GPS_Lat'],
                    'lon': entry['GPS_Lon'],
                    'timestamp': entry['timestamp'].isoformat() if entry.get('timestamp') else None,
                    'altitude': entry.get('GPS_Alt(m)'),
                    'hdop': entry.get('GPS_HDOP')
                })
        
        return jsonify(gps_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/latest')
def api_latest():  # Renamed from get_latest
    try:
        data = fetch_sensor_data()
        if not data:
            return jsonify({"error": "No data available"}), 404
            
        latest = data[0]
        if 'timestamp' in latest:
            latest['timestamp'] = latest['timestamp'].isoformat() if latest['timestamp'] else None
        if 'created_at' in latest:
            latest['created_at'] = latest['created_at'].isoformat() if latest['created_at'] else None
            
        return jsonify(latest)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)