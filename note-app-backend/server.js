require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ User Schema & Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

// ✅ Note Schema & Model
const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: String,  // ✅ New: Store Image URL or Base64
  audio: String,  // ✅ New: Store Audio URL or Base64
});
const Note = mongoose.model("Note", NoteSchema);


// ✅ Middleware to Verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error signing up" });
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// ✅ Create Note
app.post("/notes", authMiddleware, async (req, res) => {
  try {
    const { title, content, image, audio } = req.body;
    const note = new Note({ title, content, image, audio, userId: req.user.id });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

// ✅ Get Notes for Logged-in User
app.get("/notes", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(Array.isArray(notes) ? notes : []); // ✅ Always return an array
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// ✅ Delete Note API (Now with Debugging)
app.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    console.log(`🔹 DELETE Request for Note ID: ${req.params.id} by User: ${req.user.id}`);

    // Find and delete the note belonging to the logged-in user
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deletedNote) {
      console.log(`❌ Note not found for ID: ${req.params.id} or does not belong to user`);
      return res.status(404).json({ error: "Note not found" });
    }

    console.log(`✅ Note deleted successfully: ${deletedNote._id}`);
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting note:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});



// ✅ Toggle Favorite
app.put("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
