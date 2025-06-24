# Referral System Backend

A complete Node.js backend project implementing a **2-level referral system** using **PostgreSQL**, **Express**, and **Socket.IO**.

This system:
- Tracks users and who referred them.
- Records purchases.
- Rewards referrers based on purchase amount.
- Sends real-time updates to referrers using WebSockets.

---

## Features

Real-time updates via Socket.IO  
2-Level referral earnings:  
&nbsp;&nbsp;&nbsp;&nbsp;→ Level 1 gets 5%  
&nbsp;&nbsp;&nbsp;&nbsp;→ Level 2 gets 1%  
PostgreSQL for relational user-referral tracking  
Modular codebase for extensibility  
API to simulate purchase and trigger earnings

---

## Tech Stack

| Tech         | Role                         |
|--------------|------------------------------|
| Node.js      | Backend runtime              |
| Express.js   | HTTP server & routing        |
| PostgreSQL   | Database                     |
| Socket.IO    | Real-time earnings updates   |
| pg (node-postgres) | PostgreSQL client     |

---

## Folder Structure

referral-system-backend/ <br />
├── index.js # Server file (Express + Socket.IO) <br />
├── db.js # PostgreSQL DB connection & methods <br />
├── referralLogic.js # Referral payout logic <br />
├── client.js # Connecting a client to the websocket to check real time updates <br />
├── notifier.js # To send whatsapp notifications
└── README.md # This file <br />

# Install dependencies and cloning the repository

<pre>git clone https://github.com/yashg0808/referral_system_backend.git
cd referral_system_backend
npm install</pre>

## Setting up PostgreSQL Database using Docker

Run the following command in the terminal when you have installed docker to create PSQL database:
<pre> docker run --name some-postgres -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres </pre>
A postgres container will be up, after pulling the POSTGRES image from DockerHub if not already present.

## Connecting with PSQL client in terminal, creating relations, and inserting dummy data

We will enter into PostgreSQL client using terminal to create the database.
<pre>docker exec -it some-postgres psql -U postgres</pre>
You will enter into PostgreSQL client, "postgres=#" in terminal.
Run the following SQL script in your PostgreSQL client to create relations, and insert dummy data:
<pre>-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  referred_by INTEGER REFERENCES users(id),
  phone_number TEXT
);

-- Purchases table
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Earnings table
CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  source_user_id INTEGER REFERENCES users(id),
  level INTEGER CHECK (level IN (1, 2)),
  amount NUMERIC NOT NULL,
  purchase_id INTEGER REFERENCES purchases(id),
  created_at TIMESTAMP DEFAULT NOW()
);

--Inserting dummy users
INSERT INTO users (id, referred_by) VALUES
  (1, NULL),       -- Root user (no referrer)
  (2, 1),          -- Referred by user 1
  (3, 2),          -- Referred by user 2
  (4, 2),          -- Referred by user 2
  (5, 1);          -- Referred by user 1

</pre>
 Now we have created relations (tables) with some users in table 'users' with the following refferal relation:<br /><br />
[1] <br />
├── [2]&emsp;&emsp;&emsp;(referred by 1)<br />
&nbsp;|&emsp;&emsp;├──[3]&emsp;(referred by 2)<br />
&nbsp;|&emsp;&emsp;└──[4]&emsp;(referred by 2)<br />
└── [5]&emsp;&emsp;&emsp;(referred by 1)<br />

## Starting the server
<pre>node index.js</pre>
In another terminal, run the following command to check live earning updates using sockets:
<pre>node client.js</pre>
Make sure till now the PSQL database client is running, server is running, client.js is running to see updates.

# APIs
1. POST &emsp;/api/purchase <br />

   Trigger a purchase event for a user. This endpoint will:

   * Record the purchase in the database.

   * Calculate and distribute earnings to level 1 and 2 referrers.

   * Emit real-time earnings updates via Socket.IO.

   * Send WhatsApp notifications to level 1 and 2 referrers using **Twilio**.


2. GET &emsp;/api/earnings/:userId <br />

   Fetch a summary of earnings for a specific user, grouped by referral level.<br />

## Summary (Testing Tips)

1. Ensure PostgreSQL is running.

2. Create atleast 3 users in referral chain (User 1 → User 2 → User 4).

3. Connect users via Socket.IO (register event).

4. Trigger purchase by User 4.

5. User 2 and User 1 should receive earning_update.


