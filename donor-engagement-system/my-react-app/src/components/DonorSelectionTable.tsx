// src/components/DonorSelectionTable.tsx
import React, { useCallback, useState } from 'react';
import { Box, Button, Typography, IconButton, Collapse } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate, Link } from 'react-router-dom';
import { DonorService } from '../services/donorService.ts';
import { useParams } from 'react-router-dom';
import { EventService } from '../services/eventService.ts';
import { useEventAndDonors } from '../hooks/useDonors.ts';
import { EventData } from '../types/event';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const donorService = new DonorService();
const eventService = new EventService();


interface DonorSelectionTableProps {
  selectedDonors: number[];  
  onSelectionChange: (selected: number[]) => void;  
}


const DonorSelectionTable: React.FC<DonorSelectionTableProps> = ({
  selectedDonors,
  onSelectionChange
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchEventAndDonors = useCallback(async () => {
    if (!id) throw new Error('Event ID is required');
    const [eventData, donorsData] = await Promise.all([
      eventService.getEventById(parseInt(id)),
      donorService.getDonorsByEvent(parseInt(id))
    ]);
    return { event: eventData as EventData, donors: donorsData };
  }, [id]);

  const { data, loading, error } = useEventAndDonors(fetchEventAndDonors);

  React.useEffect(() => {
    if (data?.donors) {
      const selectedIds = data.donors
        .filter(donor => 
          donor.state === 'selected' || 
          donor.state === 'confirmed'
                
        )
        .map(donor => donor.id);
      onSelectionChange(selectedIds);
    }
  }, [data?.donors, onSelectionChange]);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return <Typography variant="h6">{error}</Typography>;
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'last_name', headerName: 'Donor Last Name', width: 150 },
    { field: 'first_name', headerName: 'Donor First Name', width: 150 },
    { field: 'total_donations', headerName: 'Total Donations', width: 180, type: 'number' },
    { field: 'communication_preference', headerName: 'Communication Preference', width: 200 },
    { field: 'location', headerName: 'Location', width: 200 },
    {
      field: 'notes',
      headerName: 'Notes',
      width: 200,
      editable: true,
      renderCell: (params) => (
        <Link
          to={`/donor/${params.row.id}`}
          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'state',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Typography color={
          params.value === 'confirmed' ? 'success.main' :
          params.value === 'selected' ? 'primary.main' :
          'text.secondary'
        }>
          {params.value}
        </Typography>
      ),
    }
  ];

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ mb: 4 }}>
        
        <Typography variant="h4" sx={{ mb: 4 }}>
          {data?.event ? `EVENTS / ${data.event.name}` : 'Loading...'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Your own donors
          </Typography>
          <IconButton 
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="small"
            sx={{ 
              ml: 1,
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!isCollapsed} timeout={300}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={data?.donors || []}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              onSelectionChange(newSelection as number[]);
            }}
            rowSelectionModel={selectedDonors}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default DonorSelectionTable;
