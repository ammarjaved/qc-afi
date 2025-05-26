import React, { useState,useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvents,LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import FeatureInfo from './FeatureInfo'


// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});






const FeatureClickHandler = ({ LayerName,onFeatureClick, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const map = e.target;
      
      setIsLoading(true);
      
      try {
        const bounds = map.getBounds();
        const size = map.getSize();
        const point = map.latLngToContainerPoint(e.latlng);
        
        const params = {
          REQUEST: 'GetFeatureInfo',
          SERVICE: 'WMS',
          VERSION: '1.1.1',
          LAYERS: LayerName,
          QUERY_LAYERS: LayerName,
          INFO_FORMAT: 'application/json',
          X: Math.round(point.x),
          Y: Math.round(point.y),
          BBOX: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
          WIDTH: size.x,
          HEIGHT: size.y,
          SRS: 'EPSG:4326',
          BUFFER: 5 // Add buffer for easier clicking
        };

        const queryString = new URLSearchParams(params).toString();
        const wmsUrl = 'http://121.121.232.54:7090/geoserver/cite/wms';
        const proxyUrl = `http://121.121.232.54:88/qc-afi/proxy.php?url=${encodeURIComponent(`${wmsUrl}?${queryString}`)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Failed to fetch feature info');
        
        const data = await response.json();
        
        if (data.features?.length > 0) {
          onFeatureClick(data.features[0]);
        } else {
          // No features found at click location
          onFeatureClick(null);
        }
      } catch (error) {
        console.error('Error fetching feature info:', error);
        onError?.(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  });

  return isLoading ? (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
      Loading feature info...
    </div>
  ) : null;
};
const { BaseLayer, Overlay } = LayersControl;

const MapComponent = ({selectedDate,selectedLayer}) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [error, setError] = useState(null);
  const defaultPosition = [3.0457599556399937, 101.62618867819415];

  const wmsOptions = {
    layers: selectedLayer,
    format: 'image/png',
    transparent: true,
    version: '1.1.1'
  };

  const filterOption = selectedDate 
  ? {
      ...wmsOptions,
      CQL_FILTER: `updated_at >= '${selectedDate} 00:00:00' AND updated_at <= '${selectedDate} 23:59:59'`
    }
  : wmsOptions;

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
  };

  const handleSave = async (changes) => {
    // Implement your save logic here
    try {
      // await updateFeatureProperties(changes);
      // alert("hi")
      if(selectedLayer=='cite:fpl1'){
        changes.table='fpl1'
      }else if(selectedLayer=='cite:dp_qc'){
        changes.table='demand_point'
      }else if(selectedLayer=='cite:sfp_l2'){
        changes.table='sfp_l2'
      }else if(selectedLayer=='cite:mfp_l3'){
        changes.table='mfp_l3'
      }else if(selectedLayer=='cite:high_rise3'){
        changes.table='dp_high_rise'
      }
      // else if(selectedLayer=='cite:dp_qc_hr'){
      //   changes.table='dp_high_rise'
      // }

      switch (changes.table) {
        case 'demand_point':
          delete changes.l1_id;
          delete changes.l2_id;
          delete changes.l3_id;
          delete changes.pk_id;
          break;
        case 'fpl1':
          delete changes.gid;
          delete changes.l2_id;
          delete changes.l3_id;
          delete changes.pk_id;

          break;
        case 'sfp_l2':
          delete changes.gid;
          delete changes.l1_id;
          delete changes.l3_id;
          delete changes.pk_id;

          break;
        case 'mfp_l3':
          delete changes.gid;
          delete changes.l1_id;
          delete changes.l2_id;
          delete changes.pk_id;

          break;
        case 'dp_high_rise':
          delete changes.gid;
          delete changes.l1_id;
          delete changes.l2_id;
          delete changes.l3_id;
  
          break;  
        default:
          break;
      }

       console.log(changes);
       console.log(selectedLayer)

      const formData = new FormData();
      formData.append('data', JSON.stringify(changes));
      const response = await fetch('http://121.121.232.54:88/qc-afi/update.php', {
        method: 'POST',
        body: formData
      });

       if (!response.ok) throw new Error('Failed to fetch feature info');
        
       const data = await response.json();

      // console.log(data);
      if(data.status === 'success') {
        alert("data successfully updated")
      }else{
        alert("failed please try again")
      }

    } catch (error) {
      // Handle error
      console.error('Error:', error);

    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={defaultPosition}
        zoom={10}
        maxZoom={21}
        style={{ height: '85vh', width: '100%' }}
      >
      <LayersControl position="topright">
      <BaseLayer name="OpenStreetMap">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        </BaseLayer>
      <BaseLayer checked name="GoogleSatelliteMap">
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
          subdomains={['mt0','mt1','mt2','mt3']}
          attribution="© Google"
        />
        </BaseLayer>
        <Overlay checked name="Regular Demand Point">
        <WMSTileLayer
          url="http://121.121.232.54:7090/geoserver/cite/wms"
          params={filterOption}
          maxZoom={22}
          minZoom={1}
          
        />
        </Overlay>

        <Overlay checked name="FP">
         <WMSTileLayer
          url="http://121.121.232.54:7090/geoserver/cite/wms"
          params={filterOption}
          maxZoom={22}
          minZoom={1}
          // params={{
          //   layers: 'cite:fpl1',
          //   format: 'image/png',
          //   transparent: true,
          //   version: '1.1.1'
          // }}
          
        />
        </Overlay>
        <Overlay checked name="SFP">
         <WMSTileLayer
          url="http://121.121.232.54:7090/geoserver/cite/wms"
          params={filterOption}
          maxZoom={22}
          minZoom={1}
          // params={{
          //   layers: 'cite:sfp_l2',
          //   format: 'image/png',
          //   transparent: true,
          //   version: '1.1.1'
          // }}
          
        />
        </Overlay>
        <Overlay checked name="MFP">
         <WMSTileLayer
          url="http://121.121.232.54:7090/geoserver/cite/wms"
          params={filterOption}
          maxZoom={22}
          minZoom={1}
          // params={{
          //   layers: 'cite:mfp_l3',
          //   format: 'image/png',
          //   transparent: true,
          //   version: '1.1.1'
          // }}
          
        />
        </Overlay>
        <Overlay checked name="DP High-Rise">
         <WMSTileLayer
          url="http://121.121.232.54:7090/geoserver/cite/wms"
          params={filterOption}
          maxZoom={22}
          minZoom={1}
          // params={{
          //   layers: 'cite:dp_qc_hr',
          //   format: 'image/png',
          //   transparent: true,
          //   version: '1.1.1'
          // }}
          
        />
        </Overlay>
        </LayersControl>

        <FeatureClickHandler
          LayerName={selectedLayer}  
          onFeatureClick={setSelectedFeature} 
          onError={handleError}
        />
      </MapContainer>

      {selectedFeature && (
        <FeatureInfo
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
          onSave={handleSave}
        />
      )}

      {error && (
        <div className="absolute top-4 left-4 z-[1000] bg-red-100 text-red-700 p-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default MapComponent;