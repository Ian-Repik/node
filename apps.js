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
        popupDescription: "Exploring Ancient Art! This Haniwa sculpture was inspired by the terracotta figures created in ancient Japan. I enjoyed learning how these figures were made and putting my own artistic style into the piece.",
        "img_name": "hanwia.jpg",

        "link": "/relics-and-relief"
    },
    {
        "_id": 2,
        "title": "Squid Slab",
        "medium": "Glazed clay slab",
        "year": "2024",
        "description": "A clay slab I made of a giant squid pulling a ship into the ocean.",
        "popupDescription": "Giant Squid! For this 3D art project, I created a clay slab showing a giant squid attacking a ship. I was inspired by sea-monster stories like 20,000 Leagues Under the Sea and wanted to make it feel like the ship was being pulled into the ocean. I built the squid in raised relief, adding suction-cup textures and flowing lines to create movement. After firing, I used blue, red, and dark brown glazes to bring the ocean, squid, and ship to life.",
        "img_name": "sqiud.jpg",
        "link": "/squid-slab"
    },
    {
        "_id": 3,
        "title": "Alien Skateboard",
        "medium": "Acrylic paint on skateboard",
        "year": "2025",
        "description": "A skateboard I painted using a skater's idea of what an alien might look like.",
        popupDescription: "Exploring Unknown Ideas! This skateboard painting was created for an AP Art project exploring people’s views on conspiracy theories and unknown ideas. I interviewed different people about what they believe could exist and used their ideas to inspire my artwork. For this piece, I asked a skater to imagine what an alien might look like and used their description to create the large green alien in the center. The artwork represents how imagination and personal perspectives can shape our understanding of the unknown.",
        "img_name": "sk8.jpg",
        "link": "/alien-skateboard"
    },
    {
        "_id": 4,
        "title": "Skeleton Poster",
        "medium": "Poster design",
        "year": "2025",
        "description": "A poster I started in my high school art club based on Yeat's music and album artwork.",
        popupDescription: "Skeleton Poster! This was a small side project I made in my high school art club. Our task was to create a poster for a music artist, and I chose Yeat because of his futuristic, high-energy sound. I enjoyed designing the poster and using the bold style of his music as inspiration.",
        "img_name": "skely.jpg",
        "link": "/skeleton-poster"
    },
    {
        "_id": 5,
        "title": "Alien Cat",
        "medium": "Painting",
        "year": "2025",
        "description": "A painting I made of a cat wearing an alien suit.",
        popupDescription: "Alien Cat! This painting was created last year as a fun project. My sister was taking a painting class and asked her teacher if I could join, and I ended up painting for a couple of days. This piece doesn’t have a deep meaning behind it, but I really enjoyed creating it and experimenting with painting. For only spending about two class days on it, I’m really happy with how it turned out.",
        "img_name": "alien_cat.jpg",
        "link": "/alien-cat"
    },
    {
        "_id": 6,
        "title": "Grain and Glow",
        "medium": "Light sculpture",
        "year": "2025",
        "description": "A light sculpture I am still working on using a green traffic light and a repeating box shape.",
        popupDescription: "Grain and Glow! This project explores the idea of using an iris aperture, similar to the aperture in a camera, to project a unique effect onto a surface. The concept worked during my experiments, but the effect wasn’t quite what I imagined, so I decided to rethink the idea. This piece is still in progress as I continue experimenting with light, projection, and different ways to create the effect I’m looking for.","img_name": "grain_glow.jpg",
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
        _id: Math.max(0, ...artworks.map((artwork) => artwork._id)) + 1,
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
app.put("/api/artworks/:id", (req, res) => {
    const artwork = artworks.find(
        (item) => item._id === Number(req.params.id)
    );

    if (!artwork) {
        return res.status(404).send({
            error: "Artwork not found."
        });
    }

    const result = validateArtwork(req.body);

    if (result.error) {
        return res.status(400).send({
            error: result.error.details[0].message
        });
    }

    artwork.title = result.value.title;
    artwork.medium = result.value.medium;
    artwork.year = result.value.year;
    artwork.description = result.value.description;
    artwork.popupDescription = result.value.popupDescription;
    artwork.img_name = result.value.img_name;

    res.status(200).send(artwork);
});
app.delete("/api/artworks/:id", (req, res) => {
    const result = Joi.number().integer().min(1).required()
        .validate(req.params.id);

    if (result.error) {
        return res.status(400).send({
            error: "Invalid artwork ID."
        });
    }

    const artwork = artworks.find(
        (item) => item._id === result.value
    );

    if (!artwork) {
        return res.status(404).send({
            error: "Artwork not found."
        });
    }

    artworks = artworks.filter(
        (item) => item._id !== result.value
    );

    res.status(200).send(artwork);
});

const validateArtwork = (artwork) => {
    const schema = Joi.object({
        title: Joi.string().trim().min(3).max(80).required(),
        medium: Joi.string().trim().min(3).max(80).required(),
        year: Joi.string().trim()
            .pattern(/^(19\d{2}|20\d{2}|2100)$/)
            .required(),
        description: Joi.string().trim().min(10).max(1000).required(),
        popupDescription: Joi.string().trim().min(10).max(2000).required(),
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