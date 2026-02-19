const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const MATERIALS_FILE = path.join(__dirname, '..', 'data', 'materials.json');
const INWARD_FILE = path.join(__dirname, '..', 'data', 'inward.json');
const OUTWARD_FILE = path.join(__dirname, '..', 'data', 'outward.json');

function readJSON(file) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

// GET /api/dashboard — user-specific stats
router.get('/', authenticateToken, (req, res) => {
    const allMaterials = readJSON(MATERIALS_FILE);
    const allInward = readJSON(INWARD_FILE);
    const allOutward = readJSON(OUTWARD_FILE);

    // Filter by user ID
    const materials = allMaterials.filter(m => m.userId === req.user.id);
    const inward = allInward.filter(t => t.userId === req.user.id);
    const outward = allOutward.filter(t => t.userId === req.user.id);

    // Summary stats
    const totalMaterials = materials.length;
    const totalInward = inward.reduce((sum, t) => sum + t.quantity, 0);
    const totalOutward = outward.reduce((sum, t) => sum + t.quantity, 0);
    const lowStockItems = materials.filter(m => m.quantity <= m.minStock);

    // Category breakdown
    const categoryMap = {};
    materials.forEach(m => {
        if (!categoryMap[m.category]) {
            categoryMap[m.category] = { category: m.category, totalQuantity: 0, count: 0 };
        }
        categoryMap[m.category].totalQuantity += m.quantity;
        categoryMap[m.category].count += 1;
    });
    const categoryBreakdown = Object.values(categoryMap);

    // Monthly transaction trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const inwardQty = inward
            .filter(t => { const td = new Date(t.date); return td >= monthStart && td <= monthEnd; })
            .reduce((sum, t) => sum + t.quantity, 0);
        const outwardQty = outward
            .filter(t => { const td = new Date(t.date); return td >= monthStart && td <= monthEnd; })
            .reduce((sum, t) => sum + t.quantity, 0);

        monthlyTrend.push({ month: monthStr, inward: inwardQty, outward: outwardQty });
    }

    // Recent transactions (last 10)
    const allTransactions = [
        ...inward.map(t => ({ ...t, type: 'INWARD' })),
        ...outward.map(t => ({ ...t, type: 'OUTWARD' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Enrich with material names
    const recentTransactions = allTransactions.map(t => ({
        ...t,
        materialName: materials.find(m => m.id === t.materialId)?.name || 'Unknown'
    }));

    // Stock levels for chart
    const stockLevels = materials.map(m => ({
        name: m.name.length > 20 ? m.name.slice(0, 20) + '…' : m.name,
        quantity: m.quantity,
        minStock: m.minStock,
        unit: m.unit
    }));

    res.json({
        summary: {
            totalMaterials,
            totalInward,
            totalOutward,
            lowStockCount: lowStockItems.length
        },
        lowStockItems,
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
        stockLevels
    });
});

module.exports = router;
