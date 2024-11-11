import React, { useState, useEffect, useMemo } from "react";
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import { theme } from "../theme/theme.ts";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const menuItems = useMemo(() => [
    { text: "Home", icon: <DashboardIcon />, path: `/${username}/dashboard` },
    { text: "Events", icon: <EventIcon />, path: `/${username}/events`, matchPaths: ["/events", "/event/"] },
    { text: "Calendar", icon: <CalendarTodayIcon />, path: `/${username}/calendar` },
    { text: "Message", icon: <ChatIcon />, path: `/${username}/message`},
    { text: "Settings", icon: <SettingsIcon />, path: `/${username}/settings` },
  ], []);

  // Initialize selectedItem based on current path
  const initialSelectedItem = useMemo(() => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find(item => {
      if (item.matchPaths) {
        return item.matchPaths.some(path => currentPath.startsWith(path));
      }
      return currentPath === item.path;
    });
    return matchingItem?.text || "Home";
  }, []);

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  // Update selected item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find(item => 
      item.path === currentPath || 
      (item.matchPaths && item.matchPaths.some(path => currentPath.startsWith(path)))
    );
    if (matchingItem) {
      setSelectedItem(matchingItem.text);
    }
  }, [location.pathname, menuItems]);

  const handleIconClick = (text: string, path: string) => {
    setSelectedItem(text);
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: { xs: '60px', sm: '230px' },
        height: "100vh",
        backgroundColor: theme.palette.primary.main,
        color: "white",
        borderRight: "1px solid rgba(255, 255, 255, 0.12)",
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'width 0.2s',
      }}
    >
      {/* Logo container - only show on larger screens */}
      <Box sx={{ 
        p: { xs: 1, sm: 2 },
        display: { xs: 'none', sm: 'flex' }, // Hide entire logo container on mobile
        justifyContent: 'flex-start',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <img 
          src="/BCCF-Logo.png" 
          alt="BC Cancer Logo" 
          style={{ 
            height: '72px',
            width: '165px'
          }} 
        />
      </Box>

      <List sx={{ 
        mt: { xs: 2, sm: 1 } // Adjust top margin when logo is hidden
      }}>
        {menuItems.map((item) => {
          const isSelected = selectedItem === item.text;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleIconClick(item.text, item.path)}
                sx={{
                  py: 1.5,
                  px: { xs: 1, sm: 2 },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected 
                      ? 'rgba(255, 255, 255, 0.15)' 
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'white', 
                  minWidth: { xs: 0, sm: 40 },
                  mr: { xs: 0, sm: 2 },
                  opacity: isSelected ? 1 : 0.7,
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiTypography-root': { 
                      fontSize: '16px',
                      color: 'white',
                      fontWeight: isSelected ? 600 : 400,
                      opacity: isSelected ? 1 : 0.7,
                      letterSpacing: '0.2px'
                    } 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
