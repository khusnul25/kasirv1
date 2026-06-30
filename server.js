const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Berhasil tersambung ke Database MongoDB"))
    .catch(err => console.error("Gagal konek ke MongoDB:", err));

const DataSchema = new mongoose.Schema({
    inventory: Array,
    history: Array,
    notes: Array,
    qris: String
});
const KasirData = mongoose.model('KasirData', DataSchema);

app.get('/api/data', async (req, res) => {
    try {
        let data = await KasirData.findOne();
        if (!data) {
            return res.json({ inventory: [], history: [], notes: [], qris: "" });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Gagal mengambil data" });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { inventory, history, notes, qris } = req.body;
        await KasirData.findOneAndUpdate(
            {}, 
            { inventory, history, notes, qris },
            { upsert: true, new: true }
        );
        res.json({ message: "Data berhasil disimpan ke Cloud!" });
    } catch (error) {
        res.status(500).json({ error: "Gagal menyimpan data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend menyala di port ${PORT}`);
});
