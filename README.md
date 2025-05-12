# 🚀 Knox: CanSat Mission Control Interface 🌌

Welcome aboard **Knox**, your mission control dashboard for monitoring CanSat telemetry like a true space explorer!  
This project simulates a full-stack CanSat data visualization platform built using **Flask** and sleek **JavaScript dashboards**.

> “To launch is easy. To control, divine.” – Flight Director, Project Knox

---

## 🛰️ Mission Objective

**Knox** is designed for real-time telemetry display of a CanSat (a mini satellite in a soda can). It provides:

- 📈 Dynamic graphs for gyroscope and motion data
- 🌡️ Temperature, pressure, and humidity insights
- 🧭 Real-time console updates
- 🧪 CSV logging of received sensor values
- 🖥️ Web interface with multiple dashboards

Whether you're simulating or actually interfacing with sensor modules (via serial or radio), this app is your ground station.

---

## 🧬 Tech Stack

- **Python 3**
- **Flask** – for backend routing and rendering
- **JavaScript + HTML/CSS** – for dashboards
- **CSV** – for data logging
- **Bootstrap & Vanilla JS** – for UI responsiveness

---

## 📂 File Structure

│
├── app.py # 🚦 Flask app for routing and data handling
├── requirements.txt # 📦 Project dependencies
├── data/
│ └── sheet.csv # 📊 Logged CanSat telemetry data
├── static/
│ ├── dashboard.js # 📈 Dashboard animations and interactivity
│ ├── console.js # 💻 Live console updates
│ └── [*.css / *.js] # 🎨 UI styles and scripts



| Route        | Description                  |
| ------------ | ---------------------------- |
| `/`          | Welcome page                 |
| `/console`   | Live console logs            |
| `/dashboard` | Gyroscope and pressure graph |
| `/gyro`      | Accelerometer visualizer     |

🧑‍🚀 Team Knox
Made by dreamers, tinkerers, and engineers aiming for the stars.
🌍 Proud participant in the CanSat Competition hosted by KLE Technological University.

📜 License
This mission control software is open-source under the MIT License.

🌌 “Don’t just shoot for the moon. Build the satellite that gets you there.”

Happy Launching!
– Team Knox 🚀




