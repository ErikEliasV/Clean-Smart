import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

interface ProfileImagePickerProps {
  currentImageUri?: string | null;
  onImageSelected: (imageUri: string) => void;
  onImageRemoved: () => void;
  size?: number;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  currentImageUri,
  onImageSelected,
  onImageRemoved,
  size = 120,
}) => {
  const { isDarkMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  React.useEffect(() => {
    setImageLoadError(false); 
  }, [currentImageUri]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua galeria de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua câmera.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  return (
    <View className="items-center">
      <View className="relative">
        <View
          className="rounded-full border-4 overflow-hidden"
          style={{
            width: size,
            height: size,
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
          }}
        >
          {currentImageUri && !imageLoadError ? (
            <Image
              source={{ uri: currentImageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={() => {
                setImageLoadError(true);
              }}
              onLoad={() => {
                setImageLoadError(false);
              }}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              {imageLoadError ? (
                <View className="items-center">
                  <ImageIcon 
                    size={size * 0.3} 
                    color={isDarkMode ? '#EF4444' : '#DC2626'} 
                  />
                  <Text className={`text-xs mt-1 text-center ${
                    isDarkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    Erro ao carregar
                  </Text>
                </View>
              ) : (
                <ImageIcon 
                  size={size * 0.4} 
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                />
              )}
            </View>
          )}
        </View>

        {isLoading && (
          <View 
            className="absolute inset-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {/* Botão de remover foto */}
        {currentImageUri && !isLoading && (
          <TouchableOpacity
            onPress={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            style={{ width: 28, height: 28 }}
          >
            <X size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={showImageOptions}
        disabled={isLoading}
        className={`mt-4 px-6 py-3 rounded-xl flex-row items-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
        }`}
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <Camera size={20} color={isDarkMode ? '#3B82F6' : '#3B82F6'} />
        <Text className={`ml-2 font-medium ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          {imageLoadError ? 'Tentar Novamente' : (currentImageUri ? 'Alterar Foto' : 'Adicionar Foto')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileImagePicker;
