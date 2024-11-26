import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QrCodeScanner({setQrCodeData}:{setQrCodeData: React.Dispatch<any>}) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    // Register the barcode scanner listener
    const subscription = CameraView.onModernBarcodeScanned((event) => {
      const { type, data } = event;
      Alert.alert('QR Code Scanned', `Type: ${type}\nData: ${data}`);
      setScannedData(data);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.remove();
    };
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.centered}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing='back'
       onBarcodeScanned={({data})=>{
   
        setQrCodeData(data)
        }}
      />
      {scannedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Scanned Data: {scannedData}</Text>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              setScannedData('null');
            }}
          >
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
  rescanButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
  },
});
