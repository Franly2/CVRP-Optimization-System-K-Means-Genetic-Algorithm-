import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        router.replace('/dashboard');
      }
    };

    checkLoginStatus();
  }, []);
  const [username, onChangeUsername] = React.useState('');
  const [password, onChangePassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false); 
  const [errorMessage, setErrorMessage] = React.useState('');
  async function login() {
    if (!username || !password) {
      setErrorMessage('Username dan password tidak boleh kosong');
      return;
    }

    setIsLoading(true); 

    try {
      const response = await fetch('http://192.168.100.52:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.access_token);
        await AsyncStorage.setItem('userRole', data.role);
        await AsyncStorage.setItem('userName', data.username);

        Alert.alert('Berhasil', `Halo ${data.username}, selamat datang!`);
        router.replace('/dashboard');
      } else {
        setErrorMessage(data.message || 'Username atau password salah');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error Jaringan', 'Gagal terhubung ke server. Pastikan IP laptop benar dan satu WiFi.');
    } finally {
      setIsLoading(false); 
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
       
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          onChangeText={onChangeUsername}
          value={username}
          placeholder='Username'
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangePassword}
          value={password}
          placeholder="Password"
          secureTextEntry
        />
        
        {errorMessage ? (
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        ) : null}

        {isLoading ? (
          <ActivityIndicator size="large" color="#4991CC" />
        ) : (
          <Button
            onPress={() => login()}
            title="Masuk"
            color="#4991CC"
            accessibilityLabel="Tombol masuk"
          />
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#000',
  },
  errorText: {
  color: '#FF3B30',
  textAlign: 'center',
  marginBottom: 15,
  fontSize: 14,
  fontWeight: 'bold',
},
});