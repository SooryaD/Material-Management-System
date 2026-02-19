import { useState, useEffect } from 'react';
import { materialsAPI } from '../services/api';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Chip, Alert, Snackbar, InputAdornment, CircularProgress
} from '@mui/material';
import {
    Add, Edit, Delete, Search, WarningAmber
} from '@mui/icons-material';

const CATEGORIES = ['Steel', 'Fasteners', 'Concrete', 'Conductor', 'Insulator', 'Foundation', 'Hardware', 'Other'];
const UNITS = ['kg', 'pcs', 'cum', 'm', 'lot', 'set', 'ton'];

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

const emptyForm = { name: '', category: '', quantity: '', unit: '', minStock: '' };

export default function MaterialsPage() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteId, setDeleteId] = useState(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const fetchMaterials = async () => {
        try {
            const res = await materialsAPI.getAll();
            setMaterials(res.data);
        } catch { /* */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchMaterials(); }, []);

    const filtered = materials.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = (mat = null) => {
        if (mat) {
            setEditId(mat.id);
            setForm({ name: mat.name, category: mat.category, quantity: mat.quantity, unit: mat.unit, minStock: mat.minStock });
        } else {
            setEditId(null);
            setForm(emptyForm);
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await materialsAPI.update(editId, form);
                setSnack({ open: true, msg: 'Material updated', severity: 'success' });
            } else {
                await materialsAPI.create(form);
                setSnack({ open: true, msg: 'Material added', severity: 'success' });
            }
            setDialogOpen(false);
            fetchMaterials();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.error || 'Error', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            await materialsAPI.delete(deleteId);
            setSnack({ open: true, msg: 'Material deleted', severity: 'success' });
            setDeleteId(null);
            fetchMaterials();
        } catch (err) {
            setSnack({ open: true, msg: err.response?.data?.error || 'Error', severity: 'error' });
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
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>Materials Inventory</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Manage tower construction materials
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{
                        background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                        fontWeight: 600, borderRadius: 2, px: 3,
                        '&:hover': { background: 'linear-gradient(135deg, #ffa726, #ff9800)' },
                    }}
                >
                    Add Material
                </Button>
            </Box>

            {/* Search */}
            <TextField
                placeholder="Search materials by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>
                }}
                sx={{ mb: 3, ...fieldSx }}
            />

            {/* Table */}
            <TableContainer component={Paper} sx={{
                background: 'rgba(20,30,55,0.7)', borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['Name', 'Category', 'Quantity', 'Unit', 'Min Stock', 'Status', 'Actions'].map(h => (
                                <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.06)', py: 4 }}>
                                    No materials found
                                </TableCell>
                            </TableRow>
                        ) : filtered.map(m => (
                            <TableRow key={m.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 500, borderColor: 'rgba(255,255,255,0.06)' }}>{m.name}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <Chip label={m.category} size="small" sx={{ background: 'rgba(33,150,243,0.15)', color: '#2196f3', fontWeight: 600, fontSize: '0.75rem' }} />
                                </TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700, borderColor: 'rgba(255,255,255,0.06)' }}>
                                    {m.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.06)' }}>{m.unit}</TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.06)' }}>{m.minStock}</TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    {m.quantity <= m.minStock ? (
                                        <Chip icon={<WarningAmber />} label="LOW" size="small" sx={{ background: 'rgba(244,67,54,0.15)', color: '#f44336', fontWeight: 700, '& .MuiChip-icon': { color: '#f44336' } }} />
                                    ) : (
                                        <Chip label="OK" size="small" sx={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 700 }} />
                                    )}
                                </TableCell>
                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <IconButton size="small" onClick={() => handleOpen(m)} sx={{ color: '#2196f3' }}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" onClick={() => setDeleteId(m.id)} sx={{ color: '#f44336' }}><Delete fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { background: '#141e37', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 } }}>
                <DialogTitle sx={{ color: '#fff', fontWeight: 700 }}>
                    {editId ? 'Edit Material' : 'Add New Material'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField label="Material Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth sx={fieldSx} />
                    <TextField label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} select fullWidth sx={fieldSx}>
                        {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ color: '#333' }}>{c}</MenuItem>)}
                    </TextField>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField label="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} fullWidth sx={fieldSx} />
                        <TextField label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} select fullWidth sx={fieldSx}>
                            {UNITS.map(u => <MenuItem key={u} value={u} sx={{ color: '#333' }}>{u}</MenuItem>)}
                        </TextField>
                    </Box>
                    <TextField label="Min Stock Level" type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} fullWidth sx={fieldSx} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)', fontWeight: 600, borderRadius: 2 }}>
                        {editId ? 'Update' : 'Add Material'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}
                PaperProps={{ sx: { background: '#141e37', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 } }}>
                <DialogTitle sx={{ color: '#fff' }}>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>Are you sure you want to delete this material?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteId(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 600, borderRadius: 2 }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
