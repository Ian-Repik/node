const mongoose = require("mongoose");
const express = require("express");
const Joi = require("joi");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

// Public API homepage, styles, and images
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());

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

// Artwork information
let artworks = [
    {
        "_id": 1,
        "title": "Relics and Relief",
        "medium": "Clay sculpture",
        "year": "2026",
        "description": "My clay haniwa with red spiky hair, modern clothes, and a skateboard.",
        "img_name": "hanwia.jpg",
        "link": "/relics-and-relief"
    },
    {
        "_id": 2,
        "title": "Squid Slab",
        "medium": "Glazed clay slab",
        "year": "2024",
        "description": "A clay slab I made of a giant squid pulling a ship into the ocean.",
        "img_name": "sqiud.jpg",
        "link": "/squid-slab"
    },
    {
        "_id": 3,
        "title": "Alien Skateboard",
        "medium": "Acrylic paint on skateboard",
        "year": "2025",
        "description": "A skateboard I painted using a skater's idea of what an alien might look like.",
        "img_name": "sk8.jpg",
        "link": "/alien-skateboard"
    },
    {
        "_id": 4,
        "title": "Skeleton Poster",
        "medium": "Poster design",
        "year": "2025",
        "description": "A poster I started in my high school art club based on Yeat's music and album artwork.",
        "img_name": "skely.jpg",
        "link": "/skeleton-poster"
    },
    {
        "_id": 5,
        "title": "Alien Cat",
        "medium": "Painting",
        "year": "2025",
        "description": "A painting I made of a cat wearing an alien suit.",
        "img_name": "alien_cat.jpg",
        "link": "/alien-cat"
    },
    {
        "_id": 6,
        "title": "Grain and Glow",
        "medium": "Light sculpture",
        "year": "2025",
        "description": "A light sculpture I am still working on using a green traffic light and a repeating box shape.",
        "img_name": "grain_glow.jpg",
        "link": "/grain-and-glow"
    }
];

// Provide artwork data to React
app.get("/api/artworks", (req, res) => {
    res.send(artworks);
});

app.post("/api/artworks", (req, res) => {
    const result = validateArtwork(req.body);

    if (result.error) {
        res.status(400).send({
            error: result.error.details[0].message
        });
        return;
    }

    const artwork = {
        _id: artworks.length + 1,
        title: result.value.title,
        medium: result.value.medium,
        year: result.value.year,
        description: result.value.description,
        popupDescription: result.value.popupDescription,
        img_name: result.value.img_name
    };

    artworks.push(artwork);
    res.status(201).send(artwork);
});

const validateArtwork = (artwork) => {
    const schema = Joi.object({
        title: Joi.string().trim().min(3).max(80).required(),
        medium: Joi.string().trim().min(3).max(80).required(),
        year: Joi.string().trim()
            .pattern(/^(19\d{2}|20\d{2}|2100)$/)
            .required(),
        description: Joi.string().trim().min(10).max(1000).required(),
        img_name: Joi.string().valid(
            "hanwia.jpg",
            "sqiud.jpg",
            "sk8.jpg",
            "skely.jpg",
            "alien_cat.jpg",
            "grain_glow.jpg"
        ).required()
    });

    return schema.validate(artwork);
};

app.listen(port, "0.0.0.0", function () {
    console.log("Server running on port " + port);
});