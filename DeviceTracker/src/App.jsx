import { useState, useEffect } from "react";
import "./index.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { icon } from "leaflet";
import { io } from 'socket.io-client';

const socket = io();

const customIcons = new icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [50, 50]
});

function App() {
  const [position, setPosition] = useState(null); // Set initial position to null
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]); // Set the initial position to the user's location

          // Add user's current location to markers
          setMarkers((prevMarkers) => [
            ...prevMarkers,
            { geocode: [latitude, longitude], popup: "You are here!" }
          ]);

          // Emit the initial location to the server
          socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      // Watch for location changes
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]); // Update state with current location
          socket.emit("send-location", { latitude, longitude });

          // Add user's updated location to markers
          setMarkers((prevMarkers) => [
            ...prevMarkers,
            { geocode: [latitude, longitude], popup: "You are here!" }
          ]);
        },
        (error) => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    socket.on('recieve-location', (data) => {
      const { id, latitude, longitude } = data;
      // Add received location to markers
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        { geocode: [latitude, longitude], popup: `Marker from ${id}` }
      ]);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('recieve-location');
    };
  }, []);

  // Only render the map when the user's position is available
  return (
    position ? (
      <MapContainer center={position} zoom={13} scrollWheelZoom={true}>
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, index) => (
          <Marker key={index} icon={customIcons} position={marker.geocode}>
            <Popup>{marker.popup}</Popup>
          </Marker>
        ))}
      </MapContainer>
    ) : (
      <div>Loading...</div>
    )
  );
}

export default App;
