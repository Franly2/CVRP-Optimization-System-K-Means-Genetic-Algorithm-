import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeStore } from '../../store/themeStore';
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol.ios";

export function OwnerDashboard() {
  const { colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Panel Owner
      </ThemedText>
      
      <View style={styles.gridContainer}>

        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/tenant/manage')}
        >
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Manage Perusahaan</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/depot/manage')}
        >
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Manage Depot</ThemedText>
        </TouchableOpacity>

        {/* Tombol Kelola Kurir */}
        <TouchableOpacity style={[styles.menuCard, { backgroundColor: colors.secondary }]}>
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Kelola Kurir</ThemedText>
        </TouchableOpacity>

        {/* Tombol Laporan */}
        <TouchableOpacity style={[styles.menuCard, { backgroundColor: colors.secondary }]}>
          <IconSymbol name="doc.text.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Laporan</ThemedText>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    marginBottom: 15,
    color: '#000', 
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  menuCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuText: {
    color: '#000', 
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  }
});