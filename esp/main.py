import network
import socket
from machine import Pin
import json
import time
import gc
import utime

# Configuration
WIFI_SSID = "FRITZ!Box 7510 BD"
WIFI_PASSWORD = "02060934382626285338"

# GPIO pin configuration (adjust these for your ESP board)
SWITCH1_PIN = 2   # GPIO2 on ESP32, D4 on ESP8266
SWITCH2_PIN = 4   # GPIO4 on ESP32, D2 on ESP8266
SERVER_PORT = 8080

def connect_wifi():
    """Connect to WiFi and return IP address"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    if wlan.isconnected():
        print(f"Already connected. IP: {wlan.ifconfig()[0]}")
        return wlan.ifconfig()[0]
    
    print(f"Connecting to WiFi: {WIFI_SSID}")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)
    
    # Wait for connection with timeout
    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        print(f"Waiting for connection... ({max_wait})")
        time.sleep(1)
    
    if wlan.status() != 3:
        print("Failed to connect to WiFi")
        print(f"WiFi status: {wlan.status()}")
        return None
    else:
        ip = wlan.ifconfig()[0]
        print(f"Connected to WiFi! IP address: {ip}")
        print(f"Full network config: {wlan.ifconfig()}")
        return ip

def setup_switches():
    """Setup GPIO pins for switches"""
    switch1 = Pin(SWITCH1_PIN, Pin.IN, Pin.PULL_UP)
    switch2 = Pin(SWITCH2_PIN, Pin.IN, Pin.PULL_UP)
    return switch1, switch2

class HTTPServer:
    def __init__(self, port=8080):
        self.port = port
        self.socket = None
        
    def start(self):
        """Start the HTTP server"""
        try:
            addr = socket.getaddrinfo('0.0.0.0', self.port)[0][-1]
            self.socket = socket.socket()
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.socket.bind(addr)
            self.socket.listen(1)
            self.socket.settimeout(0.1)  # Non-blocking
            print(f"HTTP server listening on port {self.port}")
            return True
        except Exception as e:
            print(f"Failed to start server: {e}")
            return False
    
    def handle_request(self, switch1, switch2):
        """Handle incoming HTTP requests"""
        try:
            client, addr = self.socket.accept()
            
            # Read the request
            request = client.recv(1024).decode('utf-8')
            
            # Parse the request line
            if request:
                request_line = request.split('\n')[0]
                print(f"Request: {request_line.strip()}")
                
                # Handle different endpoints
                if '/switches' in request_line:
                    # Return current switch states
                    response_data = {
                        "switch1": switch1.value(),
                        "switch2": switch2.value()
                    }
                    self.send_json_response(client, response_data)
                    
                elif '/status' in request_line:
                    # Health check endpoint - use utime for ESP compatibility
                    response_data = {"status": "ok", "uptime": utime.ticks_ms()}
                    self.send_json_response(client, response_data)
                    
                else:
                    # Default response
                    response_data = {
                        "message": "ESP Switch Server",
                        "endpoints": ["/switches", "/status"],
                        "board": "ESP32/ESP8266"
                    }
                    self.send_json_response(client, response_data)
            
            client.close()
            time.sleep(0.01)
            gc.collect()

        except OSError:
            # No incoming connections, continue
            pass
        except Exception as e:
            print(f"Request handling error: {e}")
    
    def send_json_response(self, client, data):
        """Send JSON HTTP response"""
        json_data = json.dumps(data)
        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type\r\n"
            "Connection: close\r\n"
            f"Content-Length: {len(json_data)}\r\n"
            "\r\n"
            f"{json_data}"
        )

        client.send(response.encode())
    
    def cleanup(self):
        """Close server socket"""
        if self.socket:
            self.socket.close()

def main():
    # Connect to WiFi first
    ip_address = connect_wifi()
    if not ip_address:
        print("Cannot continue without WiFi connection")
        return
    
    # Setup hardware
    switch1, switch2 = setup_switches()
    
    # Track switch states
    last_state1 = switch1.value()
    last_state2 = switch2.value()
    
    print(f"Initial switch states - Switch1: {last_state1}, Switch2: {last_state2}")
    
    # Start server
    server = HTTPServer(SERVER_PORT)
    if not server.start():
        print("Failed to start server")
        return
    
    print("\n" + "="*50)
    print(f"ESP READY!")
    print(f"IP Address: {ip_address}")
    print(f"Server Port: {SERVER_PORT}")
    print(f"Update your React app with: picoIP: '{ip_address}'")
    print(f"Switch 1 on GPIO {SWITCH1_PIN}")
    print(f"Switch 2 on GPIO {SWITCH2_PIN}")
    print(f"Test URL: http://{ip_address}:{SERVER_PORT}/switches")
    print("="*50 + "\n")
    
    # Main loop
    try:
        while True:
            # Handle HTTP requests
            server.handle_request(switch1, switch2)
            
            # Check switch states for console output
            current_state1 = switch1.value()
            current_state2 = switch2.value()
            
            if current_state1 != last_state1:
                print(f"Switch 1: {last_state1} -> {current_state1}")
                last_state1 = current_state1
            
            if current_state2 != last_state2:
                print(f"Switch 2: {last_state2} -> {current_state2}")
                last_state2 = current_state2
            
            # Small delay
            time.sleep(0.01)  # 10ms
            
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error in main loop: {e}")
    finally:
        server.cleanup()
        print("Server stopped")

if __name__ == "__main__":
    main()