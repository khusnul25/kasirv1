const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

const DataSchema = new mongoose.Schema({
    inventory: Array,
    history: Array,
    notes: Array,
    qris: String
});
const KasirData = mongoose.models.KasirData || mongoose.model('KasirData', DataSchema);

app.get('/api/data', async (req, res) => {
    await connectDB();
    let data = await KasirData.findOne();
    res.json(data || { inventory: [], history: [], notes: [], qris: "" });
});

app.post('/api/data', async (req, res) => {
    await connectDB();
    const { inventory, history, notes, qris } = req.body;
    await KasirData.findOneAndUpdate({}, { inventory, history, notes, qris }, { upsert: true, new: true });
    res.json({ message: "Data berhasil disimpan!" });
});

module.exports = app;
