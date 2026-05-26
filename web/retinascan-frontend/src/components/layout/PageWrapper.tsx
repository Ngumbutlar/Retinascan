import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  // Optional overrides per page if truly needed
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  noPadding?: boolean;
}

export default function PageWrapper({
  children,
  maxWidth = 'xl',
  noPadding = false,
}: PageWrapperProps) {
  return (
    <Box
      component="main"
      sx={{
        // Pushes content below the fixed navbar (64px tall)
        marginTop: '64px',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: 'background.default',
        width: '100%',
      }}
    >
      <Container
        maxWidth={maxWidth}
        disableGutters={noPadding}
        sx={{
          // Responsive vertical padding — tight on mobile, generous on desktop
          py: noPadding ? 0 : { xs: 2, sm: 3, md: 4, lg: 5 },
          // Responsive horizontal padding
          px: noPadding ? 0 : { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}