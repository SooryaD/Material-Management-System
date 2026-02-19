import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Typography, IconButton, Avatar, Divider, Tooltip
} from '@mui/material';
import {
    Dashboard, Inventory2, CallReceived, CallMade,
    Logout, Menu as MenuIcon, ChevronLeft
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const navItems = [
    { label: 'Dashboard', icon: Dashboard, path: '/' },
    { label: 'Materials', icon: Inventory2, path: '/materials' },
    { label: 'Inward', icon: CallReceived, path: '/inward' },
    { label: 'Outward', icon: CallMade, path: '/outward' },
];

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a1628' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(195deg, #0d1f3c 0%, #0a1628 100%)',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden',
                    },
                }}
            >
                {/* Logo */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', px: collapsed ? 1 : 2, py: 2,
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden',
                        cursor: 'pointer',
                    }}
                        onClick={() => navigate('/')}
                    >
                        <Box
                            component="img"
                            src="/voltran-logo.jpg"
                            alt="Voltran"
                            sx={{
                                width: collapsed ? 40 : 140,
                                height: 'auto',
                                objectFit: 'contain',
                                flexShrink: 0,
                                borderRadius: 1,
                                transition: 'width 0.3s ease',
                                filter: 'drop-shadow(0 2px 8px rgba(230,120,0,0.2))',
                            }}
                        />
                    </Box>
                    {!collapsed && (
                        <IconButton onClick={() => setCollapsed(true)} sx={{ color: 'rgba(255,255,255,0.3)' }}>
                            <ChevronLeft fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {collapsed && (
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                        <IconButton onClick={() => setCollapsed(false)} sx={{ color: 'rgba(255,255,255,0.3)' }}>
                            <MenuIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

                {/* Nav Items */}
                <List sx={{ px: 1, py: 2, flex: 1 }}>
                    {navItems.map(item => {
                        const active = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                                <ListItem disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            minHeight: 48,
                                            px: collapsed ? 2 : 2.5,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            background: active ? 'rgba(255,152,0,0.12)' : 'transparent',
                                            borderLeft: active ? '3px solid #ff9800' : '3px solid transparent',
                                            '&:hover': {
                                                background: active ? 'rgba(255,152,0,0.15)' : 'rgba(255,255,255,0.04)',
                                            },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: collapsed ? 0 : 40,
                                            color: active ? '#ff9800' : 'rgba(255,255,255,0.35)',
                                            justifyContent: 'center',
                                        }}>
                                            <Icon fontSize="small" />
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: active ? 600 : 400,
                                                    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                        );
                    })}
                </List>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

                {/* User & Logout */}
                <Box sx={{ p: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, mb: 1,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}>
                        <Avatar sx={{
                            width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                        }}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </Avatar>
                        {!collapsed && (
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    {user?.username || 'User'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                                    {user?.role || 'USER'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Tooltip title="Logout" placement="right">
                        <ListItemButton onClick={handleLogout} sx={{
                            borderRadius: 2, mt: 0.5,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            '&:hover': { background: 'rgba(244,67,54,0.1)' },
                        }}>
                            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, color: 'rgba(255,255,255,0.35)', justifyContent: 'center' }}>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }} />
                            )}
                        </ListItemButton>
                    </Tooltip>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{
                flexGrow: 1, p: 4, minHeight: '100vh',
                background: '#0a1628',
                transition: 'margin-left 0.3s ease',
            }}>
                <Outlet />
            </Box>
        </Box>
    );
}
