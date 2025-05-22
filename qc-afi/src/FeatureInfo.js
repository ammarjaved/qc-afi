import React, { useState,useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {Select, MenuItem} from '@mui/material';
import Typography from '@mui/material/Typography';


const FeatureInfo = ({ feature, onClose,onSave }) => {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changes, setChanges] = useState({});  
  useEffect(() => {
    if (feature?.properties) {
      setFormData(feature.properties);
      setChanges({});
    }
  }, [feature]);
  if (!feature) return null;
 
  // Debug log
 // console.log('Feature in FeatureInfo:', feature);

  

  // Handle input change for a specific field
  const handleInputChange = (key, value) => {
    //console.log(key+'-----'+value);
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Track changes for specific fields
    setChanges(prev => ({
      ...prev,
      [key]: value,
       'gid':formData.hasOwnProperty('gid')? formData.gid : undefined,
       'l1_id':formData.hasOwnProperty('l1_id')? formData.l1_id : undefined,
       'l2_id':formData.hasOwnProperty('l2_id')? formData.l2_id : undefined,
       'l3_id':formData.hasOwnProperty('l3_id')? formData.l3_id : undefined
      //  'l1_id':formData.hasOwnProperty('l1_id')? formData.l1_id : undefined



    }));
  };




  const renderPropertyValue = (key, value) => {
    // Check if the value is an image URL (ends with common image extensions)
    const isImage = typeof value === 'string' && 
      /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(value);

      
    
    // Check if the value is a long text (more than 100 characters)
    const isLongText = typeof value === 'string' && value.length > 100;

    if (isImage) {
      return (
        // <div className="relative">
        //   <img 
        //     src={formData[key]} 
        //     alt={key}
        //     width="50px"
        //     height="50px"
        //     className="max-w-full h-auto rounded cursor-pointer hover:opacity-90"
        //     onClick={() => window.open(value, '_blank')}
        //   />
          
        // </div>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={formData[key]}
            alt={key}
            style={{ width: 100, height: 50 }} // Adjust size as needed
            onClick={() => window.open(value, '_blank')}
          />
          <Typography variant="body1" sx={{ mt: 1 }}>
            {key}
          </Typography>
        </Box>


      );
    }
    else if(key==='qa_status'){
      return   (
    <Select
    fullWidth
      value={formData[key] ?? ''}
      label={key}
      size="small"
      onChange={(e) => handleInputChange(key, e.target.value)}
      disabled={!isEditing}

    >
      <MenuItem value="Accept">Accept</MenuItem>
      <MenuItem value="Reject">Reject</MenuItem>
    </Select>
      )
    }  
    else {
      return   (
        <TextField 
        fullWidth
        label={key}
        type="text"
        margin="normal"
        value={formData[key] ?? ''} // Use nullish coalescing instead of OR
        // or value={formData[key] === null ? '' : formData[key]}
        onChange={(e) => handleInputChange(key, e.target.value)}
        disabled={!isEditing}
      />
      )
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(changes);
      setIsEditing(false);
      setChanges({});
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    }
  };


  return (
    <div style={{
      position: 'absolute',
      top: '90px',
      right: '0px',
      width: '375px',
      backgroundColor: 'white',
      padding: '0px',
      borderRadius: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        {/* <h3 style={{ margin: 0 }}>Feature Information</h3> */}
        <button 
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>

      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <Button
          color='warning' 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit Properties
          </Button>
        ) : (
          <div className="space-x-2">
            <Button
              color='warning' 
              onClick={() => {
                setIsEditing(false);
                setFormData(feature.properties);
                setChanges({});
              }}
            >
              Cancel
            </Button>
            <Button
              color='warning' 
              onClick={handleSubmit}
              disabled={Object.keys(changes).length === 0}
              className={`px-4 py-2 text-white rounded-md ${
                Object.keys(changes).length > 0
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(feature.properties).map(([key, value]) => (
              <tr key={key}>
                {/* <td className="p-2 border-b align-top">{key}</td> */}
                <td className="p-2 border-b">
                  {renderPropertyValue(key, value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </form>
      </div>
    </div>
  );
  };

  export default FeatureInfo;