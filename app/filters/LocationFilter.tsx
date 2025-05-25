import React from "react";
import { View, Text, TextInput } from "react-native";
import { useApp } from "../context/AppContext"; // 👈 darkMode ophalen

interface LocationFilterProps {
  label: string;
  value: string;
  onChange: (location: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  label,
  value,
  onChange,
}) => {
  const { darkMode } = useApp(); // 👈 hier darkMode gebruiken

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: darkMode ? "#FFF" : "#0f0D23", marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: darkMode ? "#1E1E1E" : "#F0F0F0",
          color: darkMode ? "#FFF" : "#0f0D23",
          padding: 8,
          borderRadius: 8,
        }}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={darkMode ? "#888" : "#666"}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

export default LocationFilter;
