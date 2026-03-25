'use client';

import { Box, Button, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/navigation';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const gentleSway = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50%      { transform: rotate(1.5deg); }
`;

export default function NotFound() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Receipt Card */}
      <Box
        sx={{
          animation: `${fadeInUp} 0.7s ease-out, ${gentleSway} 6s ease-in-out 0.7s infinite`,
          transformOrigin: 'top center',
          position: 'relative',
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: 280,
            bgcolor: 'background.paper',
            borderRadius: '4px 4px 0 0',
            boxShadow: `0 20px 60px ${alpha(theme.palette.text.primary, 0.08)}, 0 4px 16px ${alpha(theme.palette.text.primary, 0.04)}`,
            pt: 3,
            px: 3,
            pb: 0,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          {/* Receipt Header */}
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: 11,
              color: 'text.disabled',
              textAlign: 'center',
              letterSpacing: 3,
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            Qashio
          </Typography>

          <Box sx={{ borderBottom: '1px dashed', borderColor: 'divider', mb: 2 }} />

          {/* Receipt Line Items */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
              Page
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
              NOT FOUND
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
              Status
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'error.main' }}>
              MISSING
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
              Transactions
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
              $0.00
            </Typography>
          </Box>

          <Box sx={{ borderBottom: '1px dashed', borderColor: 'divider', my: 2 }} />

          {/* 404 Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
              ERROR TOTAL
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: -1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 2, borderColor: 'grey.200', mb: 1.5 }} />

          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: 'text.disabled',
              textAlign: 'center',
              mb: 2,
            }}
          >
            {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Box>

        {/* Torn edge at the bottom of the receipt */}
        <Box
          sx={{
            width: 280,
            height: 16,
            bgcolor: 'background.paper',
            maskImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 280 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h280v4c-4 0-4 8-8 8s-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8V0z\' fill=\'%23fff\'/%3E%3C/svg%3E")',
            WebkitMaskImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 280 16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h280v4c-4 0-4 8-8 8s-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8-4 8-8 8-4-8-8-8V0z\' fill=\'%23fff\'/%3E%3C/svg%3E")',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.text.primary, 0.04)})`,
          }}
        />
      </Box>

      {/* Message */}
      <Box
        sx={{
          textAlign: 'center',
          animation: `${fadeInUp} 0.7s ease-out 0.2s both`,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          This page doesn&apos;t exist
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 15,
            maxWidth: 320,
          }}
        >
          Looks like this transaction was never recorded. Let&apos;s get you back on track.
        </Typography>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          animation: `${fadeInUp} 0.7s ease-out 0.4s both`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'background.paper',
            },
          }}
        >
          Go back
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          href="/transactions"
          sx={{
            fontWeight: 600,
            px: 3,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          Transactions
        </Button>
      </Box>

      {/* Subtle barcode decoration */}
      <Box
        sx={{
          mt: 6,
          opacity: 0.15,
          display: 'flex',
          gap: '2px',
          animation: `${fadeInUp} 0.7s ease-out 0.6s both`,
        }}
      >
        {[3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 2, 1, 1, 3].map(
          (w, i) => (
            <Box
              key={i}
              sx={{
                width: w * 2,
                height: 32,
                bgcolor: 'text.primary',
                borderRadius: 0.5,
              }}
            />
          ),
        )}
      </Box>
    </Box>
  );
}
