import { useState, useEffect, type ReactNode } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ScreeningReport from '../components/pdf/ScreeningReport';
import {
  AddAPhotoOutlined as CameraFabIcon,
  BarChartOutlined as BarChartIcon,
  DescriptionOutlined as PdfIcon,
  DownloadOutlined as DownloadIcon,
  QueryBuilderOutlined as ClockIcon,
  RemoveRedEyeOutlined as EyeIcon,
  Search as SearchIcon,
  ShieldOutlined as ShieldIcon,
  TrendingUpOutlined as TrendingUpIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../services/api';
import toast from 'react-hot-toast';

// --- Interfaces ---

interface ScreeningRecord {
  id: number;
  patient_name: string;
  patient_age: number;
  patient_sex: string;
  hospital_id: string;
  eye: string;
  grade: number;
  grade_label: string;
  confidence: number;
  recommendation_urgency: string;
  recommendation_color: string;
  refer: boolean;
  facility_name: string;
  screened_at: string;
}

interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="label"
      sx={{
        display: 'block',
        mb: 0.75,
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.secondary',
      }}
    >
      {children}
    </Typography>
  );
}

function GradeBadge({ record }: { record: ScreeningRecord }) {
  const color = record.recommendation_color;
  return (
    <Chip
      label={record.grade_label}
      size="small"
      sx={{
        height: 26,
        fontWeight: 700,
        borderRadius: '999px',
        fontSize: '0.72rem',
        bgcolor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    />
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card sx={{ borderRadius: '10px' }}>
      <CardContent className="flex items-center gap-3 p-4!">
        <div className="grid size-9 place-items-center rounded-md bg-[#EDF2F0] text-brand-green">
          {icon}
        </div>
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-wider text-brand-muted">
            {label}
          </p>
          <p className="text-[1.35rem] font-bold text-brand-slate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Records() {
  // --- State ---
  const navigate = useNavigate();
  const [records, setRecords] = useState<ScreeningRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    grade: '',
    eye: '',
  });

  // Local state for search input to handle debounce
  const [searchQuery, setSearchQuery] = useState('');

  // --- Fetch Logic ---
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('per_page', '10');
      if (filters.search) params.append('search', filters.search);
      if (filters.grade)  params.append('grade',  filters.grade);
      if (filters.eye)    params.append('eye',     filters.eye);

      const response = await api.get(`/api/records?${params}`);
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load screening history. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchQuery }));
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Re-fetch on filter or page change
  useEffect(() => {
    fetchRecords();
  }, [currentPage, filters]);

  // --- Handlers ---
  const handleOpenPreview = (id: number) => {
    setSelectedRecordId(id);
    setIsPreviewOpen(true);
  };

  const handleViewRecordById = (recordId: number) => {
    navigate(`/patients/${recordId}`);
  }

  return (
    <Box className="relative w-full pb-20">
      <ScreeningReport
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        recordId={selectedRecordId}
      />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
            Screening History
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Review and manage clinical screening records and AI diagnostics.
          </Typography>
        </div>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: '#E2E8F0',
            color: 'text.primary',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.5,
            py: 1,
            bgcolor: 'background.paper',
            '&:hover': { borderColor: '#C8E6D4', bgcolor: 'background.paper' },
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mt-6" sx={{ borderRadius: '10px' }}>
        <CardContent className="p-4!">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <TextField
                fullWidth
                size="small"
                placeholder="Search by patient name, ID or report ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F9FBFA',
                  },
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <FilterLabel>Date range</FilterLabel>
              <FormControl fullWidth size="small">
                <Select
                  value="30"
                  disabled
                  sx={{ borderRadius: '8px', bgcolor: '#F9FBFA' }}
                >
                  <MenuItem value="7">Last 7 Days</MenuItem>
                  <MenuItem value="30">Last 30 Days</MenuItem>
                  <MenuItem value="90">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="lg:col-span-2">
              <FilterLabel>Grade</FilterLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={filters.grade || 'all'}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? '' : e.target.value;
                    setFilters(prev => ({ ...prev, grade: val }));
                    setCurrentPage(1);
                  }}
                  sx={{ borderRadius: '8px', bgcolor: '#F9FBFA' }}
                >
                  <MenuItem value="all">All Grades</MenuItem>
                  <MenuItem value="0">Normal (Healthy)</MenuItem>
                  <MenuItem value="1">Mild NPDR</MenuItem>
                  <MenuItem value="2">Moderate NPDR</MenuItem>
                  <MenuItem value="3">Severe NPDR</MenuItem>
                  <MenuItem value="4">Proliferative (PDR)</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="lg:col-span-3">
              <FilterLabel>Eye</FilterLabel>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={filters.eye || 'all'}
                onChange={(_, value) => {
                  if (value) {
                    setFilters(prev => ({ ...prev, eye: value === 'all' ? '' : value }));
                    setCurrentPage(1);
                  }
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#E2E8F0',
                    color: 'text.secondary',
                    py: 0.75,
                  },
                  '& .Mui-selected': {
                    bgcolor: 'primary.main !important',
                    color: '#fff !important',
                    borderColor: 'primary.main !important',
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="Left">L</ToggleButton>
                <ToggleButton value="Right">R</ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="mt-4" sx={{ borderRadius: '10px' }}>
        <CardContent className="p-0!">
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FBFA' }}>
                  {['Report ID', 'Patient Name', 'Date', 'Eye', 'Grade', 'Confidence', 'Refer', 'Actions'].map(
                    (col) => (
                      <TableCell
                        key={col}
                        align={col === 'Actions' ? 'right' : 'left'}
                        sx={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          color: 'text.secondary',
                          py: 1.75,
                        }}
                      >
                        {col.toUpperCase()}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Alert 
                        severity="error" 
                        action={<Button color="inherit" size="small" onClick={fetchRecords}>Retry</Button>}
                        sx={{ display: 'inline-flex' }}
                      >
                        {error}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                        No screening records found matching your criteria.
                      </Typography>
                      <Button component={Link} to="/new-screening" variant="contained">
                        Start New Screening
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ color: '#718096', fontWeight: 600 }}>#RS{row.id}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Box 
                          onClick={() => handleViewRecordById(row.id)}
                          sx={{
                            cursor: 'pointer', 
                            '&:hover': { textDecoration: 'underline' } 
                          }}
                        >
                          {row.patient_name}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{dayjs(row.screened_at).format('DD MMM YYYY')}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.eye === 'Left' ? 'L' : 'R'}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            bgcolor: '#EDF2F0',
                            color: 'text.secondary',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell><GradeBadge record={row} /></TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <div className="flex items-center gap-2">
                          <LinearProgress
                            variant="determinate"
                            value={row.confidence > 1 ? row.confidence : row.confidence * 100}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 999,
                              bgcolor: '#EDF2F0',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 999,
                                bgcolor: 'primary.main',
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 28 }}>
                            {Math.round(row.confidence > 1 ? row.confidence : row.confidence * 100)}%
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.refer ? 'YES' : 'NO'} 
                          size="small"
                          color={row.refer ? 'error' : 'default'}
                          variant={row.refer ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 800, fontSize: '0.62rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewRecordById(row.id)}
                          sx={{ color: 'primary.main' }}
                          aria-label="View record"
                        >
                          <EyeIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'text.secondary' }} 
                          aria-label="Download PDF"
                          onClick={() => handleOpenPreview(row.id)}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <div className="flex flex-col gap-3 border-t border-[#E8EDEA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {pagination 
                ? `Showing ${(pagination.page - 1) * pagination.per_page + 1} to ${Math.min(pagination.page * pagination.per_page, pagination.total)} of ${pagination.total.toLocaleString()} records • Page ${pagination.page} of ${pagination.pages}`
                : 'Loading records...'}
            </Typography>
            <Pagination
              count={pagination?.pages || 0}
              page={currentPage}
              onChange={(_, value) => setCurrentPage(value)}
              disabled={loading}
              shape="rounded"
              size="small"
              sx={{
                 '& .MuiPaginationItem-root': { fontWeight: 700 },
                 '& .Mui-selected': {
                   bgcolor: 'primary.main !important',
                   color: '#fff !important',
                 },
               }}
             />
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<BarChartIcon fontSize="small" />} label="Total Screenings" value={pagination?.total.toLocaleString() || '...'} />
        <SummaryCard icon={<TrendingUpIcon fontSize="small" />} label="AI Flagged Rate" value="18.4%" />
        <SummaryCard icon={<ShieldIcon fontSize="small" />} label="Mean Confidence" value="96.2%" />
        <SummaryCard icon={<ClockIcon fontSize="small" />} label="Avg. Processing" value="4.2s" />
      </div>

      {/* FAB */}
      <Fab
        component={Link}
        to="/new-screening"
        color="primary"
        aria-label="New screening"
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          bgcolor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        <CameraFabIcon />
      </Fab>
    </Box>
  );
}
