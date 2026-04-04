import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeStore } from '../../store/themeStore'; // Pastikan path store sesuai
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol.ios";

export function AdminDashboard() {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Panel Admin
      </ThemedText>
      
      <View style={styles.gridContainer}>
        {/* Tombol Manage Depot */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/depot/manage')}
        >
          <IconSymbol name="house.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Manage Depot</ThemedText>
        </TouchableOpacity>

        {/* Tombol Kelola Kurir */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: colors.secondary }]}
          onPress={() => { /* Navigasi Kurir */ }}
        >
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <ThemedText style={styles.menuText}>Kelola Kurir</ThemedText>
        </TouchableOpacity>

        {/* Tombol Laporan */}
        <TouchableOpacity 
          style={[styles.menuCard, { backgroundColor: colors.secondary }]}
          onPress={() => { /* Navigasi Laporan */ }}
        >
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
    padding: 20,
    borderRadius: 12,
    // Jika ingin container mengikuti dark mode, ganti '#fff' dengan warna dari theme
  },
  title: {
    marginBottom: 15,
    color: '#000',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12, // Sedikit lebih kecil agar 3 kolom muat dengan baik
  },
  menuCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  menuText: {
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  }
});