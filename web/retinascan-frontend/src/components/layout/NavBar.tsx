import * as React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Typography,
  ListItemIcon,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  VerifiedUser as ShieldCheckIcon,
  Lightbulb as LightbulbIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', url: '/dashboard' },
  { label: 'Records', url: '/records' },
  { label: 'Referrals', url: '/referrals' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      {/* <Avatar src="/favicon.ico" sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }} /> */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
        RetinaScan
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} to={item.url} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar component="nav" position="fixed" color="inherit" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo area */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.primary',
              mr: 2,
            }}
          >
            <Avatar src="/favicon.ico" sx={{ width: 32, height: 32, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, color: 'primary.main' }}
            >
              RetinaScan
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.label} 
                component={Link} 
                to={item.url} 
                sx={{ color: 'text.secondary', textTransform: 'none', px: 2, '&:hover': { color: 'primary.main' } }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Action Icons & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              component={Link}
              to="/new-screening"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 700,
                px: 2.25,
                py: 0.9,
              }}
            >
              New Screening
            </Button>
            <IconButton size="small" component={Link} to="/search" color="inherit">
              <SearchIcon />
            </IconButton>
            <IconButton size="small" component={Link} to="/inbox" color="inherit">
              <InboxIcon />
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
              <Avatar src="/favicon.ico" variant="rounded" sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/my-profile">
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                My profile
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/settings">
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/privacy-policy">
                <ListItemIcon><ShieldCheckIcon fontSize="small" /></ListItemIcon>
                Privacy policy
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/share-feedback">
                <ListItemIcon><LightbulbIcon fontSize="small" /></ListItemIcon>
                Share feedback
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
}