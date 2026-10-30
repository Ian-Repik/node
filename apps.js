const mongoose = require("mongoose");
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3001;

// MongoDB example from class
const schema = new mongoose.Schema({
    name: String,
});

const Message = mongoose.model("Message", schema);

const message = new Message({
    name: "Hello World",
});

async function createMessage() {
    const result = await message.save();
    console.log(result);
}

mongoose
    .connect(process.env.MONGODB_URI, { dbName: "testdb" })
    .then(() => {
        console.log("Connected to MongoDB...");
        return createMessage();
    })
    .catch((err) => {
        console.error("MongoDB error:", err);
    });

// Display the React website
app.use(express.static(path.join(__dirname, "build")));

app.get(/.*/, function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, "0.0.0.0", function () {
    console.log("Server running on port " + port);
});