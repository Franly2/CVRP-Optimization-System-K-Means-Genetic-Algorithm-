import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapComponent() {
  const ip_address = process.env.EXPO_PUBLIC_API_IP_ADDRESS;
  const API_URL = `http://${ip_address}:3000/vrp/optimize`;
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<{latitude: number, longitude: number}[]>([]);
  const [targets, setTargets] = useState<any[]>([]); // State untuk simpan titik paket

  

  useEffect(() => {
    let locationSubscription: any;

    (async () => {
      // iziiin, minta lokasi
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin akses lokasi ditolak oleh sistem.');
        setIsLoading(false);
        return;
      }

      // watcher (realtimee tracking)
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, 
          distanceInterval: 5, // Update setiap bergerak 5 meter
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          
          // update tampilan
          setLocation((prev: any) => ({
            ...prev,
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }));

          fetchRoute(latitude, longitude);
          
          setIsLoading(false);
        }
      );
    })();

    // matiin sensor gps saat komponen unmount biar ga boros baterai
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // const fetchRoute = async (startLat: number, startLng: number) => {
  //   try {
  //     const response = await fetch(API_URL, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         courierLat: startLat,
  //         courierLng: startLng,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (data.coords && data.coords.length > 0) {
  //       console.log(`Berhasil tarik ${data.coords.length} titik dari NestJS!`);
  //       setRouteCoords(data.coords);
  //       setIsLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Gagal koneksi ke NestJS:", error);
  //     setIsLoading(false);
  //   }
  // };

  const fetchRoute = async (startLat: number, startLng: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierLat: startLat, courierLng: startLng }),
      });

      const data = await response.json();

      if (data.coords) {
        setRouteCoords(data.coords);
        setTargets(data.targets); //lat dan long setiap titik paket
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4991CC" />
          <Text style={styles.loadingText}>Menghitung Rute Cerdas...</Text>
        </View>
      ) : errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion ={location} 
          region={location} // biat update posisi saat bergerak
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Lokasi Anda"
              pinColor="blue"
            />
          )}
          
          {targets.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              title={item.title}
              pinColor="red"
            />
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              key={`route-${routeCoords.length}`}
              coordinates={routeCoords}
              strokeColor="#4991CC"
              strokeWidth={5}
              lineJoin="round"
              lineCap="round"
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center', padding: 20 },
});