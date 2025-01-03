import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';
import { useEvents } from '../hooks/useEvents.ts';
import { EventService } from '../services/eventService.ts';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { EventData } from '../types/event.ts';


const eventService = new EventService();
interface EventListProps {
  role: string | null;
}

const EventList: React.FC<EventListProps> = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const fetchEvents = useCallback(async (): Promise<EventData[]> => {
    if (role === 'Fundraiser' || role === 'EventLeader') {
      const events = await eventService.getEvents();
      console.log(events); // Log the events to verify the data
      return events;
    } else if (role === 'Coordinator') {
      const events = await eventService.getAllEvents();
      console.log(events); // Log the events to verify the data
      return events;
    }
    return Promise.resolve([]); // Ensure a Promise<EventData[]> is always returned
  }, [role]);
  
  const { events, loading, error } = useEvents(fetchEvents);
  
  const handleEventClick = (id: number) => {
    navigate(`/event/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center"  minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TableContainer 
            component={Paper} 
            sx={{ 
              boxShadow: 'none',
              width: '100%',
              overflowX: 'auto'
            }}
          >
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    Event Name
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    Organizer
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    Start Time
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    End Time
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    Location
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                  >
                    Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .map((event) => (
                    <TableRow 
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <TableCell
                      sx={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '120px' // Adjust maxWidth as needed
                        }}
                      >
                        {event.name}
                      </TableCell>
                      <TableCell
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          maxWidth: '100px' // Adjust maxWidth as needed
                        }}
                      >
                        {event.organizer?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{new Date(event.start_time).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(event.end_time).toLocaleDateString()}</TableCell>
                      <TableCell
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          maxWidth: '120px' // Adjust maxWidth as needed
                        }}
                      >
                        {event.location}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          maxWidth: '150px' // Adjust maxWidth as needed
                        }}
                      >
                        {event.description}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default EventList;