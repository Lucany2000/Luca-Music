import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, StatusBar, SafeAreaView, Button, FlatList } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { play } from './AudioProvider.js';

/**
 * Formats the filename to not include file extensions and removes any "the" or "a" from the beginning of the string for sorting
 * @param {string} filename 
 * @returns 
 */
const formatFilenameForSorting = (filename) => {
  const index = filename.lastIndexOf(".") < 0 ? filename.length : filename.lastIndexOf(".");
  return filename.trim().toLowerCase().substring(0, index).replace(/^the /, "").replace(/^a /, "");
};

export default function App() {
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [songList, setList] = useState([]);

  async function getAudioFiles() {
      let perms = await requestPermission();

      if(perms.granted) {
        let media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio'
        })
        media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            sortBy: 'default',
            first: media.totalCount
        })
        
        // Sets the audio list, sorting alphabetically and removing any duplicate file names
        setList(media.assets.sort((a, b) => formatFilenameForSorting(a.filename) > formatFilenameForSorting(b.filename)).reduce((prev, next) => {
          if(!prev.find(s => s.filename.toLowerCase() == next.filename.toLowerCase())) {
            prev.push(next);
          }

          return prev;
        }, []));
        console.log(media.totalCount);
      }
  }

  /**
   * Gets the audio files only on startup
   */
  useEffect(() => {
      getAudioFiles();
  }, []);

  /**
   * Renders the flatlist items
   */
  const renderItem = useMemo(() => ({ item }) =>
    {
      // if(item.filename.toLowerCase().includes("black") && item.filename.toLowerCase().includes("paint")) {
      //   console.log(item);
      // }
      return <Button title={item.filename.substring(0, item.filename.lastIndexOf("."))} style={styles.row} onPress={() => play(item.uri)}/>;
    },
  []);

  return(
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        data={songList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        initialNumToRender={500}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0
  },
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: '#fff',
  },
  row: {
    width: "100%",
    height: "auto"
  },
  floating_button: {
    width: "100%",
    position: "absolute"
  }
});
