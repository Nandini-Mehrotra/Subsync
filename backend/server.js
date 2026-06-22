const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const subtitleRoutes = require("./routes/subtitleRoutes");

const app = express();

connectDB();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(cors());
app.use(express.json());

// app.post("/test-signup", (req, res) => {
//   res.json({ message: "Test signup route working", body: req.body });
// });


app.use("/api/auth", authRoutes);

const path = require("path");

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("SubSync Backend Running");
});
// only logged in users can upload files
app.use("/api/subtitles", subtitleRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});