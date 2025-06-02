/*
 * Serial-based Barcode/QR Scanner Arduino Uno
 * Sends scanned data via Serial to computer bridge program
 * Hardware: Arduino Uno + USB Host Shield
 */

#include <usbhid.h>
#include <usbhub.h>
#include <hiduniversal.h>
#include <hidboot.h>
#include <SPI.h>

String hasil;
bool scanComplete = false;

class MyParser : public HIDReportParser {
  public:
    MyParser();
    void Parse(USBHID *hid, bool is_rpt_id, uint8_t len, uint8_t *buf);
  protected:
    uint8_t KeyToAscii(bool upper, uint8_t mod, uint8_t key);
    virtual void OnKeyScanned(bool upper, uint8_t mod, uint8_t key);
    virtual void OnScanFinished();
};

MyParser::MyParser() {}

void MyParser::Parse(USBHID *hid, bool is_rpt_id, uint8_t len, uint8_t *buf) {
  if (buf[2] == 1 || buf[2] == 0) return;

  for (uint8_t i = 7; i >= 2; i--) {
    if (buf[i] == 0) continue;

    if (buf[i] == UHS_HID_BOOT_KEY_ENTER) {
      OnScanFinished();
    } else {
      bool shift_pressed = (buf[0] & 0x22) != 0;
      OnKeyScanned(shift_pressed, buf[0], buf[i]);
    }
    return;
  }
}

uint8_t MyParser::KeyToAscii(bool shift_pressed, uint8_t mod, uint8_t key) {
  // Letters A-Z
  if (VALUE_WITHIN(key, 0x04, 0x1d)) {
    if (shift_pressed) return (key - 4 + 'A');
    else return (key - 4 + 'a');
  }
  
  // Numbers and special characters on number row
  else if (VALUE_WITHIN(key, 0x1e, 0x27)) {
    if (shift_pressed) {
      switch (key) {
        case 0x1e: return '!'; case 0x1f: return '@'; case 0x20: return '#';
        case 0x21: return '$'; case 0x22: return '%'; case 0x23: return '^';
        case 0x24: return '&'; case 0x25: return '*'; case 0x26: return '(';
        case 0x27: return ')';
      }
    } else {
      return ((key == 0x27) ? '0' : key - 0x1e + '1');
    }
  }
  
  // Special characters
  else {
    switch (key) {
      case 0x2c: return ' ';
      case 0x2d: return shift_pressed ? '_' : '-';
      case 0x2e: return shift_pressed ? '+' : '=';
      case 0x2f: return shift_pressed ? '{' : '[';
      case 0x30: return shift_pressed ? '}' : ']';
      case 0x31: return shift_pressed ? '|' : '\\';
      case 0x33: return shift_pressed ? ':' : ';';
      case 0x34: return shift_pressed ? '"' : '\'';
      case 0x35: return shift_pressed ? '~' : '`';
      case 0x36: return shift_pressed ? '<' : ',';
      case 0x37: return shift_pressed ? '>' : '.';
      case 0x38: return shift_pressed ? '?' : '/';
      default: return 0;
    }
  }
  return 0;
}

void MyParser::OnKeyScanned(bool shift_pressed, uint8_t mod, uint8_t key) {
  uint8_t ascii = KeyToAscii(shift_pressed, mod, key);
  if (ascii != 0) {
    hasil = hasil + (char)ascii;
  }
}

void MyParser::OnScanFinished() {
  // Send structured data for easy parsing
  Serial.print("QR_SCAN:");
  Serial.println(hasil);
  hasil = "";
  scanComplete = true;
}

USB          Usb;
HIDUniversal Hid(&Usb);
MyParser     Parser;

void setup() {
  Serial.begin(115200);
  Serial.println("ARDUINO_READY");
  
  // Initialize USB Host Shield
  if (Usb.Init() == -1) {
    Serial.println("ERROR:USB_INIT_FAILED");
  } else {
    Serial.println("USB_READY");
  }
  delay(200);
  
  Hid.SetReportParser(0, &Parser);
  Serial.println("SCANNER_READY");
}

void loop() {
  Usb.Task();
  
  // Check for commands from computer
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "STATUS") {
      Serial.println("ONLINE");
    } else if (command == "PING") {
      Serial.println("PONG");
    }
  }
}