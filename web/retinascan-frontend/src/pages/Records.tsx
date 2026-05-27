import { useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
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
import { Link } from 'react-router-dom';

type RecordRow = {
  reportId: string;
  patientName: string;
  hospitalId: string;
  date: string;
  eye: 'OD' | 'OS';
  grade: 'R0 - NORMAL' | 'R1 - MILD' | 'R2 - MODERATE' | 'R3 - SEVERE';
  confidence: number;
};

const RECORDS: RecordRow[] = [
  {
    reportId: '#RS-88219',
    patientName: 'Jonathan Harker',
    hospitalId: 'HOSP-4421',
    date: 'Oct 24, 2023',
    eye: 'OD',
    grade: 'R2 - MODERATE',
    confidence: 94,
  },
  {
    reportId: '#RS-88218',
    patientName: 'Elena Rodriguez',
    hospitalId: 'HOSP-9921',
    date: 'Oct 24, 2023',
    eye: 'OS',
    grade: 'R0 - NORMAL',
    confidence: 96,
  },
  {
    reportId: '#RS-88115',
    patientName: 'Arthur Morgan',
    hospitalId: 'HOSP-3310',
    date: 'Oct 23, 2023',
    eye: 'OD',
    grade: 'R3 - SEVERE',
    confidence: 91,
  },
  {
    reportId: '#RS-88112',
    patientName: 'Sarah Jenkins',
    hospitalId: 'HOSP-1102',
    date: 'Oct 23, 2023',
    eye: 'OS',
    grade: 'R1 - MILD',
    confidence: 92,
  },
  {
    reportId: '#RS-88218',
    patientName: 'Elena Rodriguez',
    hospitalId: 'HOSP-9921',
    date: 'Oct 24, 2023',
    eye: 'OS',
    grade: 'R0 - NORMAL',
    confidence: 96,
  },
];

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

function gradeChip(grade: RecordRow['grade']) {
  const baseSx = { height: 26, fontWeight: 700, borderRadius: '999px', fontSize: '0.72rem' };

  switch (grade) {
    case 'R0 - NORMAL':
      return <Chip label={grade} size="small" sx={{ ...baseSx, bgcolor: '#E8F5EE', color: '#1A6B3C' }} />;
    case 'R1 - MILD':
      return <Chip label={grade} size="small" sx={{ ...baseSx, bgcolor: '#FFF7E6', color: '#B7791F' }} />;
    case 'R2 - MODERATE':
      return <Chip label={grade} size="small" sx={{ ...baseSx, bgcolor: '#FFF0D9', color: '#C05621' }} />;
    case 'R3 - SEVERE':
      return <Chip label={grade} size="small" sx={{ ...baseSx, bgcolor: '#FFE8EA', color: '#C1121F' }} />;
    default:
      return <Chip label={grade} size="small" sx={baseSx} />;
  }
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
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [eyeFilter, setEyeFilter] = useState('all');
  const [page, setPage] = useState(1);

  return (
    <Box className="relative w-full pb-20">
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
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
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  sx={{ borderRadius: '8px', bgcolor: '#F9FBFA' }}
                >
                  <MenuItem value="all">All Grades</MenuItem>
                  <MenuItem value="r0">R0 - Normal</MenuItem>
                  <MenuItem value="r1">R1 - Mild</MenuItem>
                  <MenuItem value="r2">R2 - Moderate</MenuItem>
                  <MenuItem value="r3">R3 - Severe</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="lg:col-span-3">
              <FilterLabel>Eye</FilterLabel>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={eyeFilter}
                onChange={(_, value) => value && setEyeFilter(value)}
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
                <ToggleButton value="l">L</ToggleButton>
                <ToggleButton value="r">R</ToggleButton>
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
                  {['Report ID', 'Patient Name', 'Hospital ID', 'Date', 'Eye', 'Grade', 'Confidence', 'Actions'].map(
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
                {RECORDS.map((row) => (
                  <TableRow key={row.reportId} hover>
                    <TableCell sx={{ color: '#718096', fontWeight: 600 }}>{row.reportId}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.patientName}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.hospitalId}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.eye}
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
                    <TableCell>{gradeChip(row.grade)}</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <div className="flex items-center gap-2">
                        <LinearProgress
                          variant="determinate"
                          value={row.confidence}
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
                          {row.confidence}%
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: 'primary.main' }} aria-label="View record">
                        <EyeIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }} aria-label="Download PDF">
                        <PdfIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <div className="flex flex-col gap-3 border-t border-[#E8EDEA] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Showing 1 to 10 of 2,481 records
            </Typography>
            <Pagination
              count={5}
              page={page}
              onChange={(_, value) => setPage(value)}
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
        <SummaryCard icon={<BarChartIcon fontSize="small" />} label="Total Screenings" value="12,842" />
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
