import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol.ios";

export function AdminDashboard() {
  return (
    <View style={{ marginTop: 20 }}>
      <ThemedText type="defaultSemiBold" style={{ marginBottom: 15 }}>Panel Admin</ThemedText>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <TouchableOpacity 
            style={{ flex: 1, backgroundColor: '#3A00C0', padding: 20, borderRadius: 12, alignItems: 'center' }}
            onPress={() => router.push('/depot/manage')}
            >
          <IconSymbol name="person.2.fill" size={32} color="#2E7D32" />
          <ThemedText>Manage Depot</ThemedText>
          </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, backgroundColor: '#E8F5E9', padding: 20, borderRadius: 12, alignItems: 'center' }}>
          <IconSymbol name="person.2.fill" size={32} color="#2E7D32" />
          <ThemedText>Kelola Kurir</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, alignItems: 'center' }}>
          <IconSymbol name="doc.text.fill" size={32} color="#EF6C00" />
          <ThemedText>Laporan</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}