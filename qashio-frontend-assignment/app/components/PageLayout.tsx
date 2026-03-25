'use client';

import { Box, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import { ReactNode, useState } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ ml: 1 }}>
            Company
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // offset for the mobile appbar
          mt: { xs: '48px', md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 