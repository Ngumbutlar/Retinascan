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
  Skeleton,
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import api from '../services/api';
import dayjs from 'dayjs';
import { useDownloadPDF } from '../hooks/useDownloadPDF';
import type { DashboardStats } from '../types/screening';

const gradeChip = (label: string, color: string) => {
  return (
    <Chip
      label={label}
      size="small"
      sx={{ 
        height: 26, 
        fontWeight: 700, 
        borderRadius: '999px',
        bgcolor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    />
  );
};

function StatCard({
  icon,
  iconBg,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number | undefined;
  loading?: boolean;
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
          {loading ? (
            <Skeleton width={60} height={32} sx={{ mt: 0.25 }} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
              {value ?? 0}
            </Typography>
          )}
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
  const navigate = useNavigate();
  const { downloadPDF } = useDownloadPDF();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentScreenings, setRecentScreenings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data.stats);
      setRecentScreenings(response.data.recent_screenings);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load clinical data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const user = authService.getCurrentUser();

  return (
    <Box className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Welcome, {user?.name || 'Doctor'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, textTransform: 'capitalize' }}>
            {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
          
          {/* Temporary debug button to verify auth storage */}
          <Button 
            size="small"
            onClick={() => console.log('Current User from Storage:', authService.getCurrentUser())}
            sx={{ mt: 1, textTransform: 'none', color: 'gray' }}
          >
            Debug: Log User Info
          </Button>
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
          value={stats?.screenings_today}
          loading={loading}
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ color: 'primary.main' }} />}
          iconBg="#E8F5EE"
          label="This month"
          value={stats?.screenings_this_month}
          loading={loading}
        />
        <StatCard
          icon={<BarChartIcon sx={{ color: '#B7791F' }} />}
          iconBg="#FFF7E6"
          label="Referrals generated"
          value={stats?.referrals_generated}
          loading={loading}
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
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton variant="text" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="error">{error}</Typography>
                        <Button size="small" onClick={fetchDashboardData}>Retry</Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentScreenings.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {row.patient_name}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {dayjs(row.screened_at).format('DD MMM YYYY')}
                          <div>{dayjs(row.screened_at).format('HH:mm')}</div>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{row.eye === 'Left' ? 'OS' : row.eye === 'Right' ? 'OD' : 'OU'}</TableCell>
                        <TableCell>{gradeChip(row.grade_label, row.recommendation_color)}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            sx={{ color: 'primary.main' }} 
                            aria-label="View"
                            onClick={() => navigate(`/patients/${row.id}`)}
                          >
                            <EyeIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="Download" onClick={() => downloadPDF(row.id)}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                Month: {dayjs().format('MMMM YYYY')}
              </Typography>
            </div>
            <Divider />

            <div className="space-y-5 px-6 py-5">
              {loading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} height={40} />)
              ) : (
                <>
                  {Object.entries({
                    'No DR': '#1A6B3C',
                    'Mild': '#2E8B57',
                    'Moderate': '#C9A84C',
                    'Severe': '#C1121F',
                    'Proliferative': '#8B0000'
                  }).map(([label, color]) => {
                    const count = stats?.grade_distribution[label] || 0;
                    const pct = stats?.screenings_total ? Math.round((count / stats.screenings_total) * 100) : 0;
                    return <GradeRow key={label} label={label} pct={pct} barColor={color} />;
                  })}
                </>
              )}
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