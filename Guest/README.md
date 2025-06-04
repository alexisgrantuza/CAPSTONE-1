# Guest Management System with QR Code Integration

A comprehensive guest management system that uses QR codes for guest registration and tracking. The system includes both a web interface and hardware integration with a QR code scanner.

## Features

### Admin Features

- Room Management
  - Create rooms with unique codes
  - View room details and guest list
  - Delete rooms
- Guest Management
  - View all registered guests
  - Track guest check-in/check-out times
  - Delete guest records
- QR Code Generation
  - Generate QR codes for guests
  - Download QR codes as PNG files

### Guest Features

- Room Entry
  - Enter room codes to access specific rooms
  - View room details
- Guest Registration
  - Register as a guest in a specific room
  - Receive QR code for check-in/check-out

### Hardware Integration

- QR Code Scanner Integration
  - Automatic guest check-in/check-out
  - Real-time data processing
  - Serial communication with Arduino

## System Architecture

### Frontend

- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- React-Toastify for notifications
- QRCode.react for QR code generation

### Backend

- Node.js with Express
- Sequelize ORM
- SQLite database
- JWT authentication
- Serial port communication

### Hardware

- Arduino Uno
- USB Host Shield
- QR Code Scanner

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Arduino IDE
- USB Host Shield
- QR Code Scanner

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Arduino Setup

1. Open `SoftwareSerialExample.ino` in Arduino IDE
2. Install required libraries:
   - USB Host Shield Library
   - HID Universal Library
3. Upload the code to Arduino
4. Connect the QR code scanner to the USB Host Shield

## Usage

### Admin Access

1. Navigate to `/admin` to access the admin login
2. Use default credentials (configured in the system)
3. Access dashboard for room and guest management

### Guest Registration

1. Enter room code in the main page
2. Fill in guest details
3. Generate and download QR code
4. Use QR code for check-in/check-out

### Room Management

1. Create rooms with unique codes
2. View guest list for each room
3. Manage room details and access

## API Endpoints

### Authentication

- POST `/api/auth/login` - Admin login
- GET `/api/auth/validate` - Validate admin token

### Rooms

- GET `/api/rooms` - Get all rooms
- POST `/api/rooms` - Create new room
- GET `/api/rooms/:id` - Get room by ID
- DELETE `/api/rooms/:id` - Delete room
- GET `/api/rooms/code/:code` - Get room by code
- GET `/api/rooms/code/:code/guests` - Get guests in room

### Guests

- GET `/api/guests` - Get all guests
- POST `/api/guests` - Create new guest
- POST `/api/guests/scan` - Handle QR scan
- PUT `/api/guests/:id/timeout` - Record time out
- DELETE `/api/guests/:id` - Delete guest

## Security Features

- JWT-based authentication
- Protected admin routes
- Input validation
- Error handling
- Secure password storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
