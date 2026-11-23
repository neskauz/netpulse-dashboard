
import json
import platform
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler

DEVICES = [
    {"name": "Servidor Principal", "ip": "192.168.1.1"},
    {"name": "Servidor DNS", "ip": "192.168.1.2"},
    {"name": "Roteador Principal", "ip": "192.168.1.254"},
    {"name": "Switch Sala 1", "ip": "192.168.1.10"},
    {"name": "Access Point", "ip": "192.168.1.20"},
    {"name": "Servidor Backup", "ip": "192.168.1.3"}
]


def check_device(device):
    system = platform.system().lower()

    if system == "windows":
        command = ["ping", "-n", "1", "-w", "1000", device["ip"]]
    else:
        command = ["ping", "-c", "1", "-W", "1", device["ip"]]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=3
        )

        output = result.stdout

        if result.returncode == 0:
            latency = None

            for part in output.replace("=", " ").split():
                if part.lower().startswith("time"):
                    try:
                        latency = float(part.split("<")[-1].replace("ms", ""))
                        break
                    except ValueError:
                        pass

            return {
                **device,
                "status": "online",
                "latency": latency
            }

        return {
            **device,
            "status": "offline",
            "latency": None
        }

    except (subprocess.TimeoutExpired, OSError):
        return {
            **device,
            "status": "offline",
            "latency": None
        }


class MonitorHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/api/devices":
            results = [check_device(device) for device in DEVICES]

            data = json.dumps(results).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()


server = HTTPServer(("127.0.0.1", 8000), MonitorHandler)

print("NETPULSE iniciado!")
print("Acesse: http://127.0.0.1:8000")

server.serve_forever()
