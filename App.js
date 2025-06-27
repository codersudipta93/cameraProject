import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, PermissionsAndroid, Platform, StyleSheet, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';

const App = props => {

  const [recognizedText, setRecognizedText] = useState('');

  // Ask for camera permission
  useEffect(() => {

    console.log('MlkitOcr:', MlkitOcr); // Should NOT be null
   }, []);


 const extractVehicleNumbers = (ocrData) =>{
  const regex = /[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{1,4}/g;
  const collectedText = [];

  for (const block of ocrData) {
    if (block?.lines) {
      for (const line of block.lines) {
        if (line?.elements) {
          for (const el of line.elements) {
            if (el?.text) collectedText.push(el.text);
          }
        }
      }
    }
  }

  // Combine all elements into a single string (space-separated)
  const joinedText = collectedText.join(" ");

  // Match against the regex
  const matches = joinedText.match(regex);

  return matches || [];
}


  const openCamera = async () => {
  const options = {
    includeBase64: false,
    quality: 0.5,
    mediaType: 'photo',
    saveToPhotos: true,
  };

  launchCamera(options, async (response) => {
    if (response.didCancel) {
      Alert.alert('User cancelled camera');
    } else if (response.errorCode) {
      console.log('Camera Error: ', response.errorMessage);
    } else {
      const asset = response?.assets?.[0];
      console.log(asset)
      if (asset?.uri) {
        try {
          const result = await MlkitOcr.detectFromUri(asset.uri); // Use `uri`, not `originalPath`
          setRecognizedText(result.map(r => r.text).join('\n'));
          console.log(JSON.stringify(result));
          console.log(result);
          console.log(extractVehicleNumbers(result))
          setRecognizedText(extractVehicleNumbers(result)[0])
          
        } catch (err) {
          console.error('OCR error:', err);
        }
      }
    }
  });
};



  return (
    <View style={styles.container}>


      <Text style={{marginBottom:20, fontSize:28,fontWeight:'800'}}>{recognizedText}</Text>


      <TouchableOpacity onPress={()=>{openCamera()}} style={styles.button}><Text style={styles.buttonText}>Open Camera</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent:'center',alignItems:'center' },
  overlay: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  resultText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default App;
