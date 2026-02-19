const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const INWARD_FILE = path.join(__dirname, '..', 'data', 'inward.json');
const OUTWARD_FILE = path.join(__dirname, '..', 'data', 'outward.json');
const MATERIALS_FILE = path.join(__dirname, '..', 'data', 'materials.json');

function readJSON(file) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ─── INWARD ───────────────────────────────────────────────

// GET /api/transactions/inward
router.get('/inward', authenticateToken, (req, res) => {
    const inward = readJSON(INWARD_FILE);
    const materials = readJSON(MATERIALS_FILE);

    // Filter transactions by user ID
    const userInward = inward.filter(t => t.userId === req.user.id);

    const enriched = userInward.map(t => ({
        ...t,
        materialName: materials.find(m => m.id === t.materialId && m.userId === req.user.id)?.name || 'Unknown'
    }));
    res.json(enriched);
});

// POST /api/transactions/inward
router.post('/inward', authenticateToken, (req, res) => {
    const { materialId, quantity, supplier, invoice, date } = req.body;
    if (!materialId || !quantity || !supplier) {
        return res.status(400).json({ error: 'materialId, quantity, and supplier are required' });
    }

    // Update material stock (ensure material belongs to user)
    const materials = readJSON(MATERIALS_FILE);
    const matIndex = materials.findIndex(m => m.id === materialId && m.userId === req.user.id);
    if (matIndex === -1) return res.status(404).json({ error: 'Material not found' });

    materials[matIndex].quantity += Number(quantity);
    materials[matIndex].updatedAt = new Date().toISOString();
    writeJSON(MATERIALS_FILE, materials);

    // Save transaction
    const inward = readJSON(INWARD_FILE);
    const newTransaction = {
        id: 'inw-' + uuidv4().slice(0, 8),
        userId: req.user.id, // Associate with current user
        materialId,
        quantity: Number(quantity),
        supplier,
        invoice: invoice || '',
        date: date || new Date().toISOString()
    };
    inward.push(newTransaction);
    writeJSON(INWARD_FILE, inward);

    res.status(201).json({
        ...newTransaction,
        materialName: materials[matIndex].name,
        newStock: materials[matIndex].quantity
    });
});

// ─── OUTWARD ──────────────────────────────────────────────

// GET /api/transactions/outward
router.get('/outward', authenticateToken, (req, res) => {
    const outward = readJSON(OUTWARD_FILE);
    const materials = readJSON(MATERIALS_FILE);

    // Filter transactions by user ID
    const userOutward = outward.filter(t => t.userId === req.user.id);

    const enriched = userOutward.map(t => ({
        ...t,
        materialName: materials.find(m => m.id === t.materialId && m.userId === req.user.id)?.name || 'Unknown'
    }));
    res.json(enriched);
});

// POST /api/transactions/outward
router.post('/outward', authenticateToken, (req, res) => {
    const { materialId, quantity, project, supervisor, date } = req.body;
    if (!materialId || !quantity || !project) {
        return res.status(400).json({ error: 'materialId, quantity, and project are required' });
    }

    // Check and update stock (ensure material belongs to user)
    const materials = readJSON(MATERIALS_FILE);
    const matIndex = materials.findIndex(m => m.id === materialId && m.userId === req.user.id);
    if (matIndex === -1) return res.status(404).json({ error: 'Material not found' });

    if (materials[matIndex].quantity < Number(quantity)) {
        return res.status(400).json({
            error: `Insufficient stock. Available: ${materials[matIndex].quantity} ${materials[matIndex].unit}`
        });
    }

    materials[matIndex].quantity -= Number(quantity);
    materials[matIndex].updatedAt = new Date().toISOString();
    writeJSON(MATERIALS_FILE, materials);

    // Save transaction
    const outward = readJSON(OUTWARD_FILE);
    const newTransaction = {
        id: 'out-' + uuidv4().slice(0, 8),
        userId: req.user.id, // Associate with current user
        materialId,
        quantity: Number(quantity),
        project,
        supervisor: supervisor || '',
        date: date || new Date().toISOString()
    };
    outward.push(newTransaction);
    writeJSON(OUTWARD_FILE, outward);

    res.status(201).json({
        ...newTransaction,
        materialName: materials[matIndex].name,
        newStock: materials[matIndex].quantity
    });
});

module.exports = router;
