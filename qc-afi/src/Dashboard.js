import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import MapComponent from './MapComponent'; // Import the map component
import { TextField,MenuItem, FormControl, Select, InputLabel } from '@mui/material';


export const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDate,setSelectedDate]=useState('');
  const [selectedLayer,setSelectedLayer]=useState('');


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('message');
    navigate('/login');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleLayerChange=(e)=>{
    setSelectedLayer(e.target.value);
  }

  return (
    <Container maxWidth={false} disableGutters>
    <Box sx={{ mt: 1 }}>
      {/* Header Paper */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="h5">
            AFI(Aerosynergy)
          </Typography>
         
        </Box>
        
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>
  
      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper elevation={3} sx={{ 
          width: '15%', 
          height: '85vh',
          overflow: 'auto' // Added for scrollable content
        }}>

        <FormControl fullWidth sx={{ mb: 2,mt:2 }}>   
          <InputLabel id="dropdown-label">Select Layer To Work</InputLabel>
          <Select
            labelId="dropdown-label"
            value={selectedLayer}
            onChange={handleLayerChange}
            label="Select an Option"
          >
            <MenuItem value="cite:dp_qc">Demand Point</MenuItem>
            <MenuItem value="cite:fpl1">FP</MenuItem>
            <MenuItem value="cite:sfp_l2">SFP</MenuItem>
            <MenuItem value="cite:mfp_l3">MFP</MenuItem>
            <MenuItem value="cite:high_rise3">dp_high_rise</MenuItem>
            {/* <MenuItem value="cite:dp_qc_hr">High-Rise</MenuItem> */}

          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2,mt:2 }}> 
        <TextField
            label='Date Filter'
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 200 }}
          />
            </FormControl>
         
        
        </Paper>
        {/* Map Container */}
        <Paper elevation={3} sx={{ 
          width: '60%', 
          height: '85vh', 
          overflow: 'hidden'  
        }}>
          <MapComponent selectedDate={selectedDate}  selectedLayer={selectedLayer} />
        </Paper>
  
        {/* Sidebar */}
        <Paper elevation={3} sx={{ 
          width: '25%', 
          height: '85vh',
          overflow: 'auto' // Added for scrollable content
        }}>
          {/* Your sidebar content */}
        </Paper>
      </Box>
    </Box>
  </Container>
  );
};

export default Dashboard;