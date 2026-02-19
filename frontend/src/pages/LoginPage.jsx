import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, IconButton, InputAdornment, Tabs, Tab
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';

export default function LoginPage() {
    const [tab, setTab] = useState(0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (tab === 0) {
                await login(username, password);
                navigate('/');
            } else {
                await register(username, password, 'USER');
                setSuccess('Registration successful! You can now login.');
                setTab(0);
                setPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #070d1a 0%, #0d1b33 30%, #142240 60%, #0a1628 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated power lines — decorative SVG background */}
            <Box sx={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
        `,
                backgroundSize: '80px 80px',
            }} />

            {/* Top-left orange glow */}
            <Box sx={{
                position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(230,120,0,0.12) 0%, transparent 60%)',
                top: -200, left: -200, filter: 'blur(40px)',
            }} />

            {/* Bottom-right blue glow */}
            <Box sx={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,100,200,0.12) 0%, transparent 60%)',
                bottom: -150, right: -150, filter: 'blur(40px)',
            }} />

            {/* Center red glow (behind card) */}
            <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,40,40,0.08) 0%, transparent 60%)',
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(60px)',
            }} />

            {/* Diagonal electric bolt lines */}
            <Box sx={{
                position: 'absolute', inset: 0, opacity: 0.03,
                background: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 100px,
          rgba(255,152,0,0.3) 100px,
          rgba(255,152,0,0.3) 101px
        )`,
            }} />

            <Card sx={{
                width: 460, maxWidth: '92vw',
                background: 'rgba(12, 22, 45, 0.75)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 5,
                boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,152,0,0.05)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #e67800, #c82828, #0064c8)',
                    borderRadius: '20px 20px 0 0',
                }
            }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 }, pt: { xs: 4, sm: 5 } }}>
                    {/* Company Logo */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            component="img"
                            src="/voltran-logo.jpg"
                            alt="Voltran Logo"
                            sx={{
                                width: 180,
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: 2,
                                mb: 1.5,
                                filter: 'drop-shadow(0 4px 20px rgba(230,120,0,0.25))',
                            }}
                        />
                        <Typography variant="body2" sx={{
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: '0.75rem',
                            letterSpacing: 3,
                            textTransform: 'uppercase',
                        }}>
                            Material Management System
                        </Typography>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                        value={tab}
                        onChange={(_, v) => { setTab(v); setError(''); setSuccess(''); }}
                        variant="fullWidth"
                        sx={{
                            mb: 3,
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 2,
                            p: 0.5,
                            '& .MuiTab-root': {
                                color: 'rgba(255,255,255,0.4)',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                borderRadius: 1.5,
                                minHeight: 42,
                                transition: 'all 0.3s ease',
                            },
                            '& .Mui-selected': {
                                color: '#fff !important',
                                background: 'linear-gradient(135deg, rgba(230,120,0,0.25), rgba(200,40,40,0.2))',
                            },
                            '& .MuiTabs-indicator': { display: 'none' },
                        }}
                    >
                        <Tab label="Sign In" />
                        <Tab label="Register" />
                    </Tabs>

                    {error && (
                        <Alert severity="error" sx={{
                            mb: 2, borderRadius: 2,
                            background: 'rgba(211,47,47,0.1)',
                            border: '1px solid rgba(211,47,47,0.2)',
                            color: '#ff6b6b',
                        }}>{error}</Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{
                            mb: 2, borderRadius: 2,
                            background: 'rgba(46,125,50,0.1)',
                            border: '1px solid rgba(46,125,50,0.2)',
                            color: '#69f0ae',
                        }}>{success}</Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.03)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(230,120,0,0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#e67800', borderWidth: 1.5 },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.3)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#e67800' },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"
                                            sx={{ color: 'rgba(255,255,255,0.25)', '&:hover': { color: 'rgba(255,255,255,0.5)' } }}>
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                mb: 3.5,
                                '& .MuiOutlinedInput-root': {
                                    color: '#fff',
                                    borderRadius: 2,
                                    background: 'rgba(255,255,255,0.03)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(230,120,0,0.4)' },
                                    '&.Mui-focused fieldset': { borderColor: '#e67800', borderWidth: 1.5 },
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.3)' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#e67800' },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: '0.95rem',
                                letterSpacing: 0.5,
                                background: 'linear-gradient(135deg, #e67800 0%, #c82828 50%, #a02020 100%)',
                                boxShadow: '0 8px 30px rgba(230,120,0,0.3), 0 2px 8px rgba(200,40,40,0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #f08c1a 0%, #d43333 50%, #b52a2a 100%)',
                                    boxShadow: '0 12px 40px rgba(230,120,0,0.4), 0 4px 12px rgba(200,40,40,0.3)',
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&:disabled': {
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.3)',
                                },
                            }}
                        >
                            {loading ? 'Please wait...' : tab === 0 ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Footer text */}
                    <Typography variant="caption" sx={{
                        display: 'block', textAlign: 'center', mt: 3,
                        color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem',
                    }}>
                        © 2026 Voltran — HV/LV Power Lines & Fiber
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
