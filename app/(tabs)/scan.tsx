import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  AppState,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { useIsFocused } from "@react-navigation/native";
import { wp, hp } from "../utils/responsive";

const Scan = () => {
  const { darkMode } = useApp();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const appState = useRef(AppState.currentState);
  const qrLock = useRef(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  // Request permissions ONLY on first mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (!isFocused) {
      setTorchOn(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      qrLock.current = false;
      // Reset any layout or scan-related issues
      setTimeout(() => {
        // force a rerender or layout adjustment if needed
      }, 10);
    }
  }, [isFocused]);

  // Refresh permission when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
        (async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === "granted");
        })();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Feedback if permission is pending or denied
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>
          Camera toestemming wordt aangevraagd...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Geen toegang tot de camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Only mount CameraView if focused */}
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchOn}
          onBarcodeScanned={({ data }) => {
            if (data && !qrLock.current) {
              qrLock.current = true;
              setTimeout(() => {
                router.push(
                  `/shipment/shipmentdetails?qrData=${encodeURIComponent(data)}`
                );
              }, 500);
            }
          }}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea} />
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay} />
      </View>

      {/* Top Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={wp(8)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTorchOn((prev) => !prev)}>
          <Ionicons
            name={torchOn ? "flashlight" : "flashlight-outline"}
            size={wp(8)}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const boxSize = wp(75);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  infoText: {
    color: "#fff",
    fontSize: wp(4),
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  topOverlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  middleRow: {
    flexDirection: "row",
  },
  sideOverlay: {
    width: (wp(100) - boxSize) / 2,
    height: boxSize,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  // filter voor camera scan pagina
  scanArea: {
    width: boxSize,
    height: boxSize,
    borderWidth: 4,
    borderColor: "#5D3FD3",
    borderRadius: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: "visible",
  },

  bottomOverlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(6) : hp(4),
    left: wp(6),
    right: wp(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default Scan;
