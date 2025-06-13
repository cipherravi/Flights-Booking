# 🛫 Flight Booking Service

A high-performance flight booking microservice built with Node.js, Express, MySQL, and Sequelize. It handles all booking operations — seat locking, payment, cancellation, and automatic cleanup. Built for scalability, modularity, and reliability.

---

## 🔐 Features

- **Seat Locking:** Prevents double booking by locking selected seats until payment
- **Idempotent Payment:** Avoids duplicate bookings through idempotency tokens
- **Dynamic Pricing:** Fare calculated based on seat type (window, aisle, middle) and class (economy → first)
- **Scheduled Cleanup:** Cron job clears pending bookings that don’t complete payment in time
- **Structured Logging:** Winston-based logs stored in rotating files
- **Modular MVC Architecture:** Scalable and clean folder structure

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MySQL** with **Sequelize ORM**
- **Sequelize CLI** for DB migrations
- **Node-cron** for scheduled jobs
- **Winston** for logging
- **dotenv** for environment management

---

## 🪑 Seat Types & Classes

| Seat Type  | Class              | Example Fare Logic          |
|------------|--------------------|-----------------------------|
| Window     | First              | Base fare × 2.0             |
| Middle     | Economy            | Base fare × 1.0             |
| Aisle      | Business           | Base fare × 1.5             |
| Window     | Premium Economy    | Base fare × 1.3             |
| ...        | ...                | Customizable fare algorithm |

> Fare is dynamically calculated by multiplying a base fare with multipliers based on seat type and class.

---

## 📁 Folder Structure
<pre>
Flights-Auth/
├── src/
│ ├── config/
│ ├── controllers/
│ ├── middlewares/
│ ├── migrations/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ ├── app.js
│ └── index.js
├── .env.example
├── package.json
└── README.md
</pre>

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cipherravi/Flights-Booking.git
cd Flights-Booking
```


### 2. Install Dependencies

npm install

### 3. Setup Environment Variables
change .env.example file to .env with actual values

### 4. Run Database Migrations

cd src
npx sequelize-cli db:migrate

### 5. Start the Development Server

npm run dev

Server will start on http://localhost:PORT

🧾 API Endpoints
<pre>

| Method | Endpoint              | Description                    | Protected |
| ------ | --------------------- | ------------------------------ | --------- |
| POST   | `/bookings`           | Create flight booking          |   ✅       |
| POST   | `/bookings/payment`   | Confirm payment (idempotent)   |   ✅       |
| GET    | `/booking/:id/status` | Get booking status             |   ✅       |
| DELETE | `/bookings`           | Cancel booking                 |   ✅       |


</pre>
> Protected endpoints require JWT cookie from the Auth Service.

### 🕒 Cron Job: Clean Up Expired Bookings

A cron job runs every few minutes to:

- Identify pending bookings that haven’t completed payment within the allowed time
- Automatically release locked seats
- Delete or mark the stale booking as expired
> This ensures locked seats don’t stay reserved forever, allowing others to book them.

🧠 Booking Flow Summary

- Lock seat → assign temporary status
- Show fare based on class + seat type
- Initiate payment with idempotency key
- On success → mark booking as CONFIRMED
- Cron checks for expired bookings and cleans them

### 📜 Logging

Winston is used to log:

- Request and response activity
- Errors and exceptions
- Authentication-related events
Logs are stored in the /logs/ directory with time-stamped filenames.

🔧 Future Enhancements

- Integration with payment gateway
- WebSocket or notification system
- Airline-level seatmap UI sync
- Admin panel for airlines to control flights

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork the repo and submit a PR.

👨‍💻 Author

Made with ❤️ by Ravi yadav


