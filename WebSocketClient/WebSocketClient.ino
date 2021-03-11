#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>

#ifndef STASSID
#define STASSID "UPC9472151"
#define STAPSK  "zv5pbYVnrrf5"
#endif

const char* ssid     = STASSID;
const char* password = STAPSK;

const char* host = "192.168.0.67";
const uint16_t port = 8080;

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;

char bootStatus[41];

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED: {
			Serial.printf("[WSc] Connected to url: %s\n", payload);

			// send message to server when Connected
			webSocket.sendTXT(bootStatus);
		}
			break;
		case WStype_TEXT:
			Serial.printf("[WSc] get text: %s\n", payload);

			// send message to server
			// webSocket.sendTXT("message here");
			break;
        case WStype_PING:
            // pong will be send automatically
            Serial.printf("[WSc] get ping\n");
            break;
        case WStype_PONG:
            // answer to a ping we send
            Serial.printf("[WSc] get pong\n");
            break;
    }

}

void setup() {
  
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP(ssid, password);

  Serial.println();
  Serial.println();
  Serial.print("Wait for WiFi... ");

  while (WiFiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  String stringIp = WiFi.localIP().toString();
  char ip[stringIp.length() + 1];
  strcpy(ip, stringIp.c_str());

  sprintf(bootStatus, "ip: %s", ip);

	// server address, port and URL
	webSocket.begin(host, port, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

}

void loop() {
	webSocket.loop();
}
