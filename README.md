# Node.js Project - IT Spark Technology

## 📌 Project Setup

### 1️⃣ Install Dependencies
Run the following command to install all required dependencies:
```sh
npm install
```

---

### 2️⃣ Create `.env` File
Create a `.env` file in the root directory and add the following environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database
PGHOST=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGPORT=

# JWT Configuration
JWT_SECRET=777106ffc1050c6d567e5a685298c6b9d48ef19f29c41cc132889f7dc23a85cf
JWT_EXPIRES_IN=24h
```

---

### 3️⃣ Run PostgreSQL Migrations
Run the following command to apply database migrations:
```sh
node database
```

---

### 4️⃣ Run Jest Test Cases
Execute the test cases using Jest:
```sh
npm test
```

---

### 5️⃣ Start the Server
Run the server in development mode:
```sh
npm run dev
```
The server will start at: **http://localhost:3000**

---

## 📌 Workflow

### 🔹 Step 1: Clone the Repository
```sh
git clone https://github.com/prakharnamdev/It-spark.git
cd It-spark
```

### 🔹 Step 2: Install Dependencies
```sh
npm install
```

### 🔹 Step 3: Set Up Environment Variables
- Create a `.env` file in the root directory.
- Copy the environment variables mentioned above and paste them into the `.env` file.

### 🔹 Step 4: Set Up Database
- Make sure PostgreSQL is installed and running.
- Run database migrations:
```sh
node database
```

### 🔹 Step 5: Run Tests (Optional)
```sh
npm test
```

### 🔹 Step 6: Start the Server
```sh
npm run dev
```
The server will be accessible at **http://localhost:3000**.

### 🔹 Step 7: Find Postman Collection in folder "Postman-collection" and delete this in files (export collection in postman)

---

## 📌 Available Commands
| Command              | Description |
|----------------------|-------------|
| `npm install`       | Install dependencies |
| `node database`   | Run database migrations |
| `npm test`          | Run Jest test cases |
| `npm run dev`       | Start the server in development mode |


---

## 📌 Technologies Used
- **Node.js** (Backend Framework)
- **Express.js** (API Development)
- **PostgreSQL** (Database)
- **JWT Authentication** (Secure Authentication)
- **Jest** (Testing Framework)
- **Dotenv** (Environment Configuration)

---

## 📌 API Endpoints User
| Method | Endpoint          | Description |                       Full Endpoint |
|--------|------------------|-------------|----------------------|--------------------------------------|
| POST   | `/register`      | User Registration |----------------| http://localhost:3000/users/register |
| POST   | `/login`         | User Login |-----------------------| http://localhost:3000/users/login |
| GET    | `/profile`       | Fetch User Notifications |---------| http://localhost:3000/users/profile |

## 📌 API Endpoints Notification
| Method | Endpoint          | Description |                        Full Endpoint |
|--------|------------------|-------------|-------------------------------------  |
| POST   | `/send`      | User Registration | http://localhost:3000/notifications/send
| POST   | `/`         | User Login | http://localhost:3000/notifications/?page=1&limit=10
| GET    | `/unread-count` | Fetch User Notifications | http://localhost:3000/notifications/unread-count
| PUT    | `/:id/read` | Fetch User Notifications | http://localhost:3000/notifications/3/read
| PUT    | `/read-all` | Fetch User Notifications | http://localhost:3000/notifications/read-all
---

