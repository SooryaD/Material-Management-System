import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Alert
} from '@mui/material';
import {
    Inventory2, TrendingUp, TrendingDown, WarningAmber,
    CallReceived, CallMade
} from '@mui/icons-material';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#ff9800', '#2196f3', '#4caf50', '#e91e63', '#9c27b0', '#00bcd4', '#ff5722'];
const SUMMARY_CARDS = [
    { key: 'totalMaterials', label: 'Total Materials', icon: Inventory2, color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
    { key: 'totalInward', label: 'Total Inward', icon: TrendingUp, color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
    { key: 'totalOutward', label: 'Total Outward', icon: TrendingDown, color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    { key: 'lowStockCount', label: 'Low Stock Alerts', icon: WarningAmber, color: '#f44336', bg: 'rgba(244,67,54,0.1)' },
];

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await dashboardAPI.getData();
                setData(res.data);
            } catch (err) {
                setError('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: '#ff9800' }} />
        </Box>
    );
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return null;

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                Overview of tower material inventory and transactions
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {SUMMARY_CARDS.map(card => {
                    const Icon = card.icon;
                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.key}>
                            <Card sx={{
                                background: 'rgba(20,30,55,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 3, backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 30px ${card.bg}` },
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, fontSize: '0.8rem' }}>
                                                {card.label}
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff' }}>
                                                {data.summary[card.key].toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            p: 1.5, borderRadius: 2, background: card.bg,
                                        }}>
                                            <Icon sx={{ color: card.color, fontSize: 28 }} />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Category Pie Chart */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{
                        background: 'rgba(20,30,55,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3, height: '100%',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                Category Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={data.categoryBreakdown}
                                        dataKey="totalQuantity"
                                        nameKey="category"
                                        cx="50%" cy="50%"
                                        outerRadius={100}
                                        strokeWidth={2}
                                        stroke="rgba(10,22,40,0.8)"
                                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.categoryBreakdown.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Transaction Bar Chart */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{
                        background: 'rgba(20,30,55,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3, height: '100%',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                Monthly Transactions
                            </Typography>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={data.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                    <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                                    <Bar dataKey="inward" name="Inward" fill="#4caf50" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="outward" name="Outward" fill="#ff9800" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Bottom Row */}
            <Grid container spacing={3}>
                {/* Low Stock Alerts */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{
                        background: 'rgba(20,30,55,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningAmber sx={{ color: '#f44336' }} /> Low Stock Alerts
                            </Typography>
                            {data.lowStockItems.length === 0 ? (
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>All stock levels are healthy</Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {data.lowStockItems.map(item => (
                                        <Box key={item.id} sx={{
                                            p: 2, borderRadius: 2, background: 'rgba(244,67,54,0.08)',
                                            border: '1px solid rgba(244,67,54,0.2)',
                                        }}>
                                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{item.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                Stock: {item.quantity} {item.unit} (Min: {item.minStock})
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Transactions */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{
                        background: 'rgba(20,30,55,0.7)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 3,
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                                Recent Transactions
                            </Typography>
                            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>Type</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>Material</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>Qty</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.recentTransactions.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                                    <Chip
                                                        size="small"
                                                        icon={t.type === 'INWARD' ? <CallReceived /> : <CallMade />}
                                                        label={t.type}
                                                        sx={{
                                                            background: t.type === 'INWARD' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                                                            color: t.type === 'INWARD' ? '#4caf50' : '#ff9800',
                                                            fontWeight: 600, fontSize: '0.7rem',
                                                            '& .MuiChip-icon': { color: 'inherit' },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.06)' }}>
                                                    {t.materialName}
                                                </TableCell>
                                                <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.06)', fontWeight: 600 }}>
                                                    {t.quantity}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)', fontSize: '0.8rem' }}>
                                                    {new Date(t.date).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
