import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Camera, CameraType, CameraView } from "expo-camera";
 
interface QRCodeScannerProps {
  onScanned: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(`QR code with type ${type} and data ${data} has been scanned!`);
    onScanned(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Requesting for camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
 <CameraView
  barcodeScannerSettings={{
    barcodeTypes: ["qr"],
  }}
/>
      {scanned && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => setScanned(false)}>
            <Text style={styles.scanAgain}>Tap to Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanAgain: {
    color: "#007bff",
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#ffffffaa",
    borderRadius: 10,
  },
});

export default QRCodeScanner;
