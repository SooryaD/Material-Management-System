import { useState, useEffect } from 'react';
import { transactionsAPI, materialsAPI } from '../services/api';
import {
    Box, Typography, Button, TextField, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Snackbar, Chip, CircularProgress
} from '@mui/material';
import { Add, CallMade } from '@mui/icons-material';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(255,152,0,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#ff9800' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#ff9800' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
};

export default function OutwardPage() {
    const [transactions, setTransactions] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ materialId: '', quantity: '', project: '', supervisor: '', date: '' });
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const fetchData = async () => {
        try {
            const [txRes, matRes] = await Promise.all([
                transactionsAPI.getOutward(),
                materialsAPI.getAll()
            ]);
            setTransactions(txRes.data);
            setMaterials(matRes.data);
        } catch { /* */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        try {
            await transactionsAPI.createOutward(form);
            setSnack({ open: true, msg: 'Outward entry recorded. Stock updated!', severity: 'success' });
            setDialogOpen(false);
            setForm({ materialId: '', quantity: '', project: '', supervisor: '', date: '' });
            fetchData();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.error || 'Insufficient stock', severity: 'error' });
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CallMade sx={{ color: '#ff9800' }} /> Outward Transactions
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Record material dispatched to project sites
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDialogOpen(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                        fontWeight: 600, borderRadius: 2, px: 3,
                        '&:hover': { background: 'linear-gradient(135deg, #ffa726, #ff9800)' },
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
                            {['Material', 'Quantity', 'Project', 'Supervisor', 'Date'].map(h => (
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
                                    No outward transactions recorded yet
                                </TableCell>
                            </TableRow>
                        ) : [...transactions].reverse().map(t => (
                            <TableRow key={t.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 500, borderColor: 'rgba(255,255,255,0.06)' }}>{t.materialName}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <Chip label={`-${t.quantity}`} size="small" sx={{ background: 'rgba(255,152,0,0.15)', color: '#ff9800', fontWeight: 700 }} />
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>{t.project}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>{t.supervisor || '—'}</TableCell>
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
                <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>New Outward Entry</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField label="Material" select value={form.materialId}
                        onChange={e => setForm({ ...form, materialId: e.target.value })} fullWidth sx={fieldSx}>
                        {materials.map(m => (
                            <MenuItem key={m.id} value={m.id} sx={{ color: '#333' }}>
                                {m.name} (Available: {m.quantity} {m.unit})
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Quantity" type="number" value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Project Name" value={form.project}
                        onChange={e => setForm({ ...form, project: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Supervisor" value={form.supervisor}
                        onChange={e => setForm({ ...form, supervisor: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Date" type="date" value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })} fullWidth sx={fieldSx}
                        InputLabelProps={{ shrink: true }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)', fontWeight: 600, borderRadius: 2 }}>
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
