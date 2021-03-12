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

char * payload;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED: {
			Serial.printf("[WSc] Connected to url: %s\n", payload);
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

char * buildConnectionUID() {
  String stringIp = WiFi.localIP().toString();
  char ip[stringIp.length() + 1];
  strcpy(ip, stringIp.c_str());

  String stringMac = WiFi.macAddress();
  char mac[stringMac.length() + 1];
  strcpy(mac, stringMac.c_str());

  char * connectionUID = (char *) malloc(stringIp.length()+stringMac.length() + 10);

  sprintf(connectionUID, "/[\"%s\",\"%s\"]",mac,ip);

  return connectionUID;
}

void connectToWifi() {
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
}
 
void setup() {
  Serial.begin(115200);

  connectToWifi();
  
  char * connectionUID = buildConnectionUID();
	webSocket.begin(host, port, connectionUID);
	webSocket.onEvent(webSocketEvent);
  free(connectionUID);

}

void loop() {
	webSocket.loop();
}
