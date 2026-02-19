const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const MATERIALS_FILE = path.join(__dirname, '..', 'data', 'materials.json');

function readMaterials() {
    return JSON.parse(fs.readFileSync(MATERIALS_FILE, 'utf-8'));
}

function writeMaterials(materials) {
    fs.writeFileSync(MATERIALS_FILE, JSON.stringify(materials, null, 2));
}

// GET /api/materials — list all materials for the authenticated user
router.get('/', authenticateToken, (req, res) => {
    const materials = readMaterials();
    const userMaterials = materials.filter(m => m.userId === req.user.id);
    res.json(userMaterials);
});

// GET /api/materials/:id — get single material
router.get('/:id', authenticateToken, (req, res) => {
    const materials = readMaterials();
    const material = materials.find(m => m.id === req.params.id && m.userId === req.user.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
});

// POST /api/materials — create material
router.post('/', authenticateToken, (req, res) => {
    const { name, category, quantity, unit, minStock } = req.body;
    if (!name || !category || quantity == null || !unit) {
        return res.status(400).json({ error: 'name, category, quantity, and unit are required' });
    }

    const materials = readMaterials();
    const newMaterial = {
        id: 'mat-' + uuidv4().slice(0, 8),
        userId: req.user.id, // Associate with current user
        name,
        category,
        quantity: Number(quantity),
        unit,
        minStock: Number(minStock) || 0,
        updatedAt: new Date().toISOString()
    };

    materials.push(newMaterial);
    writeMaterials(materials);
    res.status(201).json(newMaterial);
});

// PUT /api/materials/:id — update material
router.put('/:id', authenticateToken, (req, res) => {
    const materials = readMaterials();
    const index = materials.findIndex(m => m.id === req.params.id && m.userId === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Material not found' });

    const { name, category, quantity, unit, minStock } = req.body;
    materials[index] = {
        ...materials[index],
        ...(name && { name }),
        ...(category && { category }),
        ...(quantity != null && { quantity: Number(quantity) }),
        ...(unit && { unit }),
        ...(minStock != null && { minStock: Number(minStock) }),
        updatedAt: new Date().toISOString()
    };

    writeMaterials(materials);
    res.json(materials[index]);
});

// DELETE /api/materials/:id — delete material
router.delete('/:id', authenticateToken, (req, res) => {
    let materials = readMaterials();
    const index = materials.findIndex(m => m.id === req.params.id && m.userId === req.user.id);
    if (index === -1) return res.status(404).json({ error: 'Material not found' });

    const deleted = materials.splice(index, 1)[0];
    writeMaterials(materials);
    res.json({ message: 'Material deleted', material: deleted });
});

module.exports = router;
