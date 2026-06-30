const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Tambahkan header CORS manual untuk memastikan browser tidak memblokir
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;
        if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI tidak ditemukan!");
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
};

const DataSchema = new mongoose.Schema({
    inventory: Array,
    history: Array,
    notes: Array,
    qris: String
});
const KasirData = mongoose.models.KasirData || mongoose.model('KasirData', DataSchema);

app.get('/api/data', async (req, res) => {
    try {
        await connectDB();
        let data = await KasirData.findOne();
        res.json(data || { inventory: [], history: [], notes: [], qris: "" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        await connectDB();
        const { inventory, history, notes, qris } = req.body;
        await KasirData.findOneAndUpdate({}, { inventory, history, notes, qris }, { upsert: true, new: true });
        res.json({ message: "Data berhasil disimpan!" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;