import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "../context/AppContext";

interface DatePickerFilterProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

const DatePickerFilter: React.FC<DatePickerFilterProps> = ({
  label,
  value,
  onChange,
}) => {
  const { darkMode } = useApp();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setIsPickerVisible(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: darkMode ? "#FFF" : "#0f0D23", marginBottom: 8 }}>
        {label}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: darkMode ? "#1E1E1E" : "#F0F0F0",
          padding: 8,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={() => setIsPickerVisible(true)}
      >
        <Text style={{ color: darkMode ? "#FFF" : "#0f0D23" }}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>
      {isPickerVisible && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          themeVariant={darkMode ? "dark" : "light"} // 👈 DIT IS NIEUW!
        />
      )}
    </View>
  );
};

export default DatePickerFilter;
