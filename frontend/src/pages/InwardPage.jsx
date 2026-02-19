import { useState, useEffect } from 'react';
import { transactionsAPI, materialsAPI } from '../services/api';
import {
    Box, Typography, Button, TextField, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Snackbar, Chip, CircularProgress
} from '@mui/material';
import { Add, CallReceived } from '@mui/icons-material';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(76,175,80,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#4caf50' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4caf50' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
};

export default function InwardPage() {
    const [transactions, setTransactions] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ materialId: '', quantity: '', supplier: '', invoice: '', date: '' });
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const fetchData = async () => {
        try {
            const [txRes, matRes] = await Promise.all([
                transactionsAPI.getInward(),
                materialsAPI.getAll()
            ]);
            setTransactions(txRes.data);
            setMaterials(matRes.data);
        } catch { /* */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            await transactionsAPI.createInward(form);
            setSnack({ open: true, msg: 'Inward entry recorded. Stock updated!', severity: 'success' });
            setDialogOpen(false);
            setForm({ materialId: '', quantity: '', supplier: '', invoice: '', date: '' });
            fetchData();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.error || 'Error', severity: 'error' });
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4caf50' }} />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CallReceived sx={{ color: '#4caf50' }} /> Inward Transactions
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Record incoming material from suppliers
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                        fontWeight: 600, borderRadius: 2, px: 3,
                        '&:hover': { background: 'linear-gradient(135deg, #66bb6a, #4caf50)' },
                    }}
                >
                    New Entry
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{
                background: 'rgba(20,30,55,0.7)', borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Material', 'Quantity', 'Supplier', 'Invoice', 'Date'].map(h => (
                                <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.06)', py: 4 }}>
                                    No inward transactions recorded yet
                                </TableCell>
                            </TableRow>
                        ) : [...transactions].reverse().map(t => (
                            <TableRow key={t.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 500, borderColor: 'rgba(255,255,255,0.06)' }}>{t.materialName}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <Chip label={`+${t.quantity}`} size="small" sx={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 700 }} />
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>{t.supplier}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>{t.invoice || '—'}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.85rem' }}>
                                    {new Date(t.date).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { background: '#141e37', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 } }}>
                <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>New Inward Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField label="Material" select value={form.materialId}
                        onChange={e => setForm({ ...form, materialId: e.target.value })} fullWidth sx={fieldSx}>
                        {materials.map(m => <MenuItem key={m.id} value={m.id} sx={{ color: '#333' }}>{m.name} ({m.quantity} {m.unit})</MenuItem>)}
                    </TextField>
                    <TextField label="Quantity" type="number" value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Supplier" value={form.supplier}
                        onChange={e => setForm({ ...form, supplier: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Invoice Number" value={form.invoice}
                        onChange={e => setForm({ ...form, invoice: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Date" type="date" value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })} fullWidth sx={fieldSx}
                        InputLabelProps={{ shrink: true }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #4caf50, #388e3c)', fontWeight: 600, borderRadius: 2 }}>
                        Record Entry
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
