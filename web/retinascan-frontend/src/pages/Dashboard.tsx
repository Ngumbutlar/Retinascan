import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  BarChartOutlined as BarChartIcon,
  DownloadOutlined as DownloadIcon,
  FiberManualRecord as DotIcon,
  InfoOutlined as InfoIcon,
  RemoveRedEyeOutlined as EyeIcon,
  TrendingUpOutlined as TrendingUpIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

type ScreeningRow = {
  patientName: string;
  date: string;
  time: string;
  eye: 'OD' | 'OS' | 'OU';
  grade: 'No DR Detected' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'PDR';
};

const SCREENINGS: ScreeningRow[] = [
  { patientName: 'Elena Rodriguez', date: '23 Oct 2023', time: '10:15', eye: 'OD', grade: 'No DR Detected' },
  { patientName: 'Arthur Morgan', date: '23 Oct 2023', time: '09:45', eye: 'OS', grade: 'Moderate NPDR' },
  { patientName: 'Sarah Jenkins', date: '23 Oct 2023', time: '09:10', eye: 'OU', grade: 'Mild NPDR' },
  { patientName: 'James Wilson', date: '22 Oct 2023', time: '16:30', eye: 'OD', grade: 'Severe NPDR' },
  { patientName: 'Maya Patel', date: '22 Oct 2023', time: '15:20', eye: 'OS', grade: 'No DR Detected' },
];

const gradeChip = (grade: ScreeningRow['grade']) => {
  const baseSx = { height: 26, fontWeight: 600, borderRadius: '999px' };

  switch (grade) {
    case 'No DR Detected':
      return (
        <Chip
          label={grade}
          size="small"
          sx={{ ...baseSx, bgcolor: '#E8F5EE', color: '#1A6B3C' }}
        />
      );
    case 'Mild NPDR':
      return (
        <Chip
          label={grade}
          size="small"
          sx={{ ...baseSx, bgcolor: '#E6F4EA', color: '#2E8B57' }}
        />
      );
    case 'Moderate NPDR':
      return (
        <Chip
          label={grade}
          size="small"
          sx={{ ...baseSx, bgcolor: '#FFF7E6', color: '#B7791F' }}
        />
      );
    case 'Severe NPDR':
      return (
        <Chip
          label={grade}
          size="small"
          sx={{ ...baseSx, bgcolor: '#FFE8EA', color: '#C1121F' }}
        />
      );
    case 'PDR':
      return (
        <Chip
          label={grade}
          size="small"
          sx={{ ...baseSx, bgcolor: '#FFE8EA', color: '#C1121F' }}
        />
      );
    default:
      return <Chip label={grade} size="small" sx={baseSx} />;
  }
};

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-center gap-4">
        <div className="grid size-10 place-items-center rounded-lg" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <div>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
            {value}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}

function GradeRow({
  label,
  pct,
  barColor,
}: {
  label: string;
  pct: number;
  barColor: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {pct}%
        </Typography>
      </div>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor: '#EDF2F0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            backgroundColor: barColor,
          },
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Box className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Welcome, Dr. Samuel Akon
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
            Monday, October 23, 2023
          </Typography>
        </div>

        <Button
          variant="outlined"
          startIcon={<DotIcon sx={{ fontSize: 12, color: 'primary.main' }} />}
          sx={{
            borderColor: '#E2E8F0',
            color: 'text.primary',
            bgcolor: 'background.paper',
            fontWeight: 700,
            borderRadius: '10px',
            px: 2,
            '&:hover': {
              borderColor: '#C8E6D4',
              bgcolor: 'background.paper',
            },
          }}
        >
          <span className="mr-1 tracking-wider text-[0.6875rem] font-extrabold uppercase text-brand-muted">
            LIVE CLINICAL DATA
          </span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={<EyeIcon sx={{ color: 'primary.main' }} />}
          iconBg="#E8F5EE"
          label="Screenings today"
          value="24"
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ color: 'primary.main' }} />}
          iconBg="#E8F5EE"
          label="This month"
          value="582"
        />
        <StatCard
          icon={<BarChartIcon sx={{ color: '#B7791F' }} />}
          iconBg="#FFF7E6"
          label="Referrals generated"
          value="18"
        />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent screenings */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-6 py-5">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Recent Screenings
              </Typography>
              <RouterLink
                to="/records"
                className="text-[0.6875rem] font-extrabold uppercase tracking-wider text-brand-green no-underline hover:text-brand-dark"
              >
                View all
              </RouterLink>
            </div>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                      }}
                    >
                      PATIENT NAME
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                      }}
                    >
                      DATE
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                      }}
                    >
                      EYE
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                      }}
                    >
                      DR GRADE
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                      }}
                    >
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SCREENINGS.map((row) => (
                    <TableRow key={`${row.patientName}-${row.date}-${row.time}`} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {row.patientName.split(' ').slice(0, 1).join(' ')}
                        <div className="font-bold">{row.patientName.split(' ').slice(1).join(' ')}</div>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {row.date}
                        <div>{row.time}</div>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.eye}</TableCell>
                      <TableCell>{gradeChip(row.grade)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="View">
                          <EyeIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="Download">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>

        {/* Grade distribution */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-5">
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Grade Distribution
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  color: 'text.secondary',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Month: October 2023
              </Typography>
            </div>
            <Divider />

            <div className="space-y-5 px-6 py-5">
              <GradeRow label="No DR Detected" pct={65} barColor="#1A6B3C" />
              <GradeRow label="Mild NPDR" pct={18} barColor="#2E8B57" />
              <GradeRow label="Moderate NPDR" pct={12} barColor="#C9A84C" />
              <GradeRow label="Severe NPDR" pct={4} barColor="#C1121F" />
              <GradeRow label="PDR" pct={1} barColor="#8B0000" />
            </div>

            <div className="px-6 pb-6">
              <Paper
                variant="outlined"
                className="rounded-xl"
                sx={{ bgcolor: '#EDF2F0', borderColor: '#E2E8F0', p: 2 }}
              >
                <div className="flex items-start gap-2.5">
                  <InfoIcon sx={{ color: 'text.secondary', mt: '2px' }} fontSize="small" />
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    AI distribution is trending towards healthy scans this week compared to the previous clinical quarter.
                  </Typography>
                </div>
              </Paper>
            </div>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
}