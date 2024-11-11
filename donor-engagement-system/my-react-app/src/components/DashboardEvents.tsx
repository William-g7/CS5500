import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Card, CardContent, CardMedia, Box, CircularProgress } from "@mui/material";
import { useEvents } from '../hooks/useEvents.ts';
import { EventService } from '../services/eventService.ts';

const eventService = new EventService();

const DashboardEvents: React.FC = () => {
  const navigate = useNavigate();
  const fetchEvents = useCallback(() => eventService.getDashboardEvents(), []);
  const { events, loading, error } = useEvents(fetchEvents);

  const handleEventClick = (id: number) => {
    navigate(`/event/${id}`);
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%'
    }}>
      <Typography variant="h5" sx={{ 
        marginBottom: 2,
        fontSize: { xs: '1rem', sm: '1rem', md: '1.25rem' }
      }}>
        Your Upcoming Events
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 1.5, md: 2 },
          width: '100%'
        }}>
          {events.map((event) => (
            <Box 
              key={event.id}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 8px)',
                  lg: 'calc(33.33% - 16px)'
                },
                minWidth: {
                  xs: '100%',
                  sm: '260px',
                  lg: '290px'
                },
                maxWidth: {
                  sm: 'calc(50% - 8px)',
                  lg: 'calc(33.33% - 16px)'
                }
              }}
            >
              <Card 
                onClick={() => handleEventClick(event.id)}
                sx={{ 
                  cursor: 'pointer',
                  border: "none", 
                  boxShadow: "none",
                  height: '100%'
                }}
              >
                <CardMedia
                  component="img"
                  alt={event.name}
                  height={{ xs: 150, sm: 180, md: 200 }}
                  image="/calendar.png"
                />
                <CardContent sx={{ 
                  flexGrow: 1, 
                  padding: { xs: 1, sm: 1.5, md: 2 }
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(event.start_time).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: 14, sm: 15, md: 16 }
                  }}>
                    {event.name}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DashboardEvents;



