//import "./_mockLocation";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Button, Alert } from "react-native";
import * as Location from "expo-location";
import MapView, { Polyline, Circle } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function App() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [lat, setLat] = useState(49.2769407);
  const [lot, setLot] = useState(-122.9683391);
  const [points, setPoints] = useState([]);
  const [watcher, setWatcher] = useState(null);
  const STORAGE_KEY = "userLocation";
  let tracking = false;
  let temp = [];

  const trackLocation = async () => {
    if (!errorMsg && !tracking) {
      tracking = true;
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          temp.push({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setPoints(points.concat(temp));
          setLat(location.coords.latitude);
          setLot(location.coords.longitude);
        }
      ).then((locationWatcher) => {
        setWatcher(locationWatcher);
      });
    }
  };

  const createAlert = (value) =>
    Alert.alert("You pressed on your steps", "Please select your option", [
      { text: "Save", onPress: () => storeData(value) },
      {
        text: "Delete",
        onPress: () => deleteData(),
      },
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.log(e);
    }
  };
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const value = jsonValue != null ? JSON.parse(jsonValue) : [];
      setPoints(Array.from(value));
    } catch (e) {
      console.log(e);
    }
  };

  const deleteData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      getData();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let { coords } = await Location.getCurrentPositionAsync({});
      if (coords) {
        setLat(coords.latitude);
        setLot(coords.longitude);
      }
      getData();
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: lat,
          longitude: lot,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        region={{
          latitude: lat,
          longitude: lot,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={points}
          lineDashPattern={[6]}
          strokeWidth={4}
          strokeColor="rgba(255,140,0,0.8)"
          tappable={true}
          onPress={() => createAlert(points)}
        />
        <Circle
          center={{ latitude: lat, longitude: lot }}
          radius={30}
          strokeColor="rgba(158,158,255,1.0)"
          fillColor="rgba(158,158,255,0.3)"
        />
      </MapView>
      <View style={styles.button1}>
        <Button
          title="Start tracking"
          onPress={() => {
            trackLocation();
          }}
        />
      </View>
      <View style={styles.button2}>
        <Button
          title="Stop tracking"
          onPress={() => {
            watcher.remove();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button1: {
    position: "absolute",
    top: "90%",
    left: "5%",
  },
  button2: {
    position: "absolute",
    top: "90%",
    left: "60%",
  },
});
