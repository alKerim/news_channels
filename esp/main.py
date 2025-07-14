import network
import socket
from machine import Pin, ADC
import json
import time
import gc
import utime

# Configuration
WIFI_SSID = "SSID"
WIFI_PASSWORD = "PASSWORD"

# GPIO pin configuration for Soldered dual-channel sliders
# Using commonly labeled ADC pins on ESP32
# Slider 1
SLIDER1_OUTA_PIN = 36   # GPIO36 (ADC1_CH0) - Channel A of first slider
SLIDER1_OUTB_PIN = 32   # GPIO32 (ADC1_CH4) - Channel B of first slider

# Slider 2
SLIDER2_OUTA_PIN = 34   # GPIO34 (ADC1_CH6) - Channel A of second slider
SLIDER2_OUTB_PIN = 33   # GPIO33 (ADC1_CH5) - Channel B of second slider

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

def setup_sliders():
    """Setup ADC pins for dual-channel sliders"""
    # Create ADC objects for all slider channels
    slider1_a = ADC(Pin(SLIDER1_OUTA_PIN))
    slider1_b = ADC(Pin(SLIDER1_OUTB_PIN))
    slider2_a = ADC(Pin(SLIDER2_OUTA_PIN))
    slider2_b = ADC(Pin(SLIDER2_OUTB_PIN))
    
    # Set attenuation for full 3.3V range (0-4095 values)
    slider1_a.atten(ADC.ATTN_11DB)
    slider1_b.atten(ADC.ATTN_11DB)
    slider2_a.atten(ADC.ATTN_11DB)
    slider2_b.atten(ADC.ATTN_11DB)
    
    return slider1_a, slider1_b, slider2_a, slider2_b

def read_slider_percentage(adc):
    """Read ADC value and convert to percentage (0-100)"""
    raw_value = adc.read()
    # Convert from 0-4095 range to 0-100 percentage
    percentage = int((raw_value / 4095) * 100)
    return percentage

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
    
    def handle_request(self, slider1_a, slider1_b, slider2_a, slider2_b):
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
                if '/sliders' in request_line:
                    # Return current slider values for all channels
                    response_data = {
                        "slider1": {
                            "channel_a": {
                                "raw": slider1_a.read(),
                                "percentage": read_slider_percentage(slider1_a)
                            },
                            "channel_b": {
                                "raw": slider1_b.read(),
                                "percentage": read_slider_percentage(slider1_b)
                            }
                        },
                        "slider2": {
                            "channel_a": {
                                "raw": slider2_a.read(),
                                "percentage": read_slider_percentage(slider2_a)
                            },
                            "channel_b": {
                                "raw": slider2_b.read(),
                                "percentage": read_slider_percentage(slider2_b)
                            }
                        }
                    }
                    self.send_json_response(client, response_data)
                    
                elif '/status' in request_line:
                    # Health check endpoint
                    response_data = {"status": "ok", "uptime": utime.ticks_ms()}
                    self.send_json_response(client, response_data)
                    
                else:
                    # Default response
                    response_data = {
                        "message": "ESP Dual-Channel Slider Server",
                        "endpoints": ["/sliders", "/status"],
                        "board": "ESP32",
                        "slider_range": "0-100%",
                        "channels": "Each slider has channels A and B"
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
    slider1_a, slider1_b, slider2_a, slider2_b = setup_sliders()
    
    # Track slider values for change detection
    last_values = {
        "s1a": read_slider_percentage(slider1_a),
        "s1b": read_slider_percentage(slider1_b),
        "s2a": read_slider_percentage(slider2_a),
        "s2b": read_slider_percentage(slider2_b)
    }
    
    print(f"Initial slider values:")
    print(f"  Slider 1A: {last_values['s1a']}%, Slider 1B: {last_values['s1b']}%")
    print(f"  Slider 2A: {last_values['s2a']}%, Slider 2B: {last_values['s2b']}%")
    
    # Start server
    server = HTTPServer(SERVER_PORT)
    if not server.start():
        print("Failed to start server")
        return
    
    print("\n" + "="*60)
    print(f"ESP READY!")
    print(f"IP Address: {ip_address}")
    print(f"Server Port: {SERVER_PORT}")
    print(f"Update your React app with: picoIP: '{ip_address}'")
    print(f"Slider 1 - Channel A: GPIO {SLIDER1_OUTA_PIN}, Channel B: GPIO {SLIDER1_OUTB_PIN}")
    print(f"Slider 2 - Channel A: GPIO {SLIDER2_OUTA_PIN}, Channel B: GPIO {SLIDER2_OUTB_PIN}")
    print(f"Test URL: http://{ip_address}:{SERVER_PORT}/sliders")
    print("="*60 + "\n")
    
    # Main loop
    try:
        while True:
            # Handle HTTP requests
            server.handle_request(slider1_a, slider1_b, slider2_a, slider2_b)
            
            # Check slider values for console output (with threshold to avoid noise)
            current_values = {
                "s1a": read_slider_percentage(slider1_a),
                "s1b": read_slider_percentage(slider1_b),
                "s2a": read_slider_percentage(slider2_a),
                "s2b": read_slider_percentage(slider2_b)
            }
            
            # Only print if there's a significant change (>= 2% to avoid noise)
            if abs(current_values["s1a"] - last_values["s1a"]) >= 2:
                print(f"Slider 1A: {last_values['s1a']}% -> {current_values['s1a']}%")
                last_values["s1a"] = current_values["s1a"]
            
            if abs(current_values["s1b"] - last_values["s1b"]) >= 2:
                print(f"Slider 1B: {last_values['s1b']}% -> {current_values['s1b']}%")
                last_values["s1b"] = current_values["s1b"]
            
            if abs(current_values["s2a"] - last_values["s2a"]) >= 2:
                print(f"Slider 2A: {last_values['s2a']}% -> {current_values['s2a']}%")
                last_values["s2a"] = current_values["s2a"]
            
            if abs(current_values["s2b"] - last_values["s2b"]) >= 2:
                print(f"Slider 2B: {last_values['s2b']}% -> {current_values['s2b']}%")
                last_values["s2b"] = current_values["s2b"]
            
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