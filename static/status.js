document.addEventListener('DOMContentLoaded', function() {
    function updateStatus() {
        fetch('/api/system-status')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }

                // Update BMP-280 status
                document.getElementById('bmp-status').textContent = data['BMP-280'].status;
                document.getElementById('bmp-temp').textContent = data['BMP-280'].temperature;
                document.getElementById('bmp-pressure').textContent = data['BMP-280'].pressure;
                document.getElementById('bmp-altitude').textContent = data['BMP-280'].altitude;

                // Update GPS status
                document.getElementById('gps-status').textContent = data.GPS.status;
                document.getElementById('gps-lat').textContent = data.GPS.latitude;
                document.getElementById('gps-lon').textContent = data.GPS.longitude;
                document.getElementById('gps-alt').textContent = data.GPS.altitude;
                document.getElementById('gps-sats').textContent = data.GPS.satellites;

                // Update Gyroscope status
                document.getElementById('gyro-status').textContent = data.Gyroscope.status;
                document.getElementById('gyro-x').textContent = data.Gyroscope.x;
                document.getElementById('gyro-y').textContent = data.Gyroscope.y;
                document.getElementById('gyro-z').textContent = data.Gyroscope.z;

                // Add this to the updateStatus function
                document.getElementById('mpu-status').textContent = data.MPU6050.status;
                document.getElementById('mpu-accel-x').textContent = data.MPU6050.accel_x;
                document.getElementById('mpu-accel-y').textContent = data.MPU6050.accel_y;
                document.getElementById('mpu-accel-z').textContent = data.MPU6050.accel_z;
                document.getElementById('mpu-gyro-x').textContent = data.MPU6050.gyro_x;
                document.getElementById('mpu-gyro-y').textContent = data.MPU6050.gyro_y;
                document.getElementById('mpu-gyro-z').textContent = data.MPU6050.gyro_z;

                // Update timestamp
                document.getElementById('timestamp').textContent = data.timestamp;
            })
            .catch(error => console.error('Error fetching status:', error));
    }

    // Initial load and periodic updates
    updateStatus();
    setInterval(updateStatus, 2000);
});