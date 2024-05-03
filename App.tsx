import React, {useState} from 'react';
import {View, Button, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {socket} from './data';
import RNFetchBlob from 'rn-fetch-blob';

function App(): JSX.Element {
  const [imageSource, setImageSource] = useState<
    Record<string, any> | undefined | null
  >(null);

  const getFileSize = async (fileUri: any) => {
    const stats = await RNFetchBlob.fs.stat(fileUri);
    return stats.size;
  };
  const selectImage = async () => {
    try {
      const response = await launchImageLibrary({
        selectionLimit: 1,
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!response?.assets) return false;
      if (response.didCancel) return console.log('User cancelled image');

      const source = {uri: response?.assets[0].uri};
      setImageSource(source);
      const fileUri = response.assets[0].uri as string;
      const fileSize = await getFileSize(fileUri);
      uploadChunks(fileUri, fileSize);
    } catch (error) {
      console.log('error', error);
    }
  };

  async function uploadChunks(fileUri: string, fileSize: number) {
    let offset = 0;
    try {
      const stream = await RNFetchBlob.fs.readStream(
        fileUri,
        'base64',
        -1,
        1000 / 200,
      );

      stream.open();


      stream.onData(async (chunk) => {
        // Upload the chunk to the server
        // Implement your server-side logic to receive and process the chunk
        // You can use fetch or any other HTTP library to make the upload request
        console.log('Uploading chunk...');
        // Update the offset for the next chunk
        offset += chunk.length;
        socket.emit("fileUpload",{thread_id:179,sender_id:238,chunk})

        // If offset exceeds fileSize, close the stream
        if (offset >= fileSize) {
          stream.closed;

          console.log('File upload completed');
        }
      });
      stream.onError((error) => {
        console.error('Error reading stream:', error);
      });

      // Listen for end of stream
      stream.onEnd(() => {
        socket.emit("fileUpload",{thread_id:179,sender_id:238,chunk:""})
        console.log('Stream ended');
      });
    } catch (error) {
      console.error('Error uploading file chunk:', error);
    }
  }
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      {imageSource && (
        <Image source={imageSource} style={{width: 200, height: 200}} />
      )}
      <Button title="Select Image" onPress={selectImage} />
    </View>
  );
}

export default App;
