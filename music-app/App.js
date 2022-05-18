import { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, StatusBar, SafeAreaView, Button, FlatList, ScrollView, View, useWindowDimensions, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { play } from './AudioProvider.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabView, SceneMap } from 'react-native-tab-view';
import SongGUI from './SongGUI.js';
import { Artist } from './Tabs.js';

const Stack = createNativeStackNavigator();
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
  const [currentSong, setCurrentSong] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Songs'},
    {key: 'second', title: 'Artists'}
  ]);

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
      return <Button title={item.filename.substring(0, item.filename.lastIndexOf("."))} style={styles.row} onPress={() => {play(item.uri); setCurrentSong(item.filename)}}/>;
    },
  []);
  
  const Songs = () => (
      <FlatList
        data={songList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        initialNumToRender={20} //500
        //maxToRenderPerBatch={500}
        // windowSize = {10}
        // getItemLayout={(item, index) => ({
        //   length: item.length,
        //   offset: item.length * index,
        //   index,
        // })}
        />
        // {/* <ScrollView>
        // {songList.map(item => <Button title={item.filename.substring(0, item.filename.lastIndexOf("."))} style={styles.row} onPress={() => play(item.uri)}></Button>)}
        // </ScrollView> */}
  );

  const Tabs = () => (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
    />   
  );

  const layout = useWindowDimensions();
  const renderScene = SceneMap({
    first: Songs, second: Artist
  });  

  const ref = useRef(null);
  return(
    <SafeAreaView style={styles.safeAreaView}>
      <NavigationContainer ref={ref}>
        <Stack.Navigator initialRouteName='App'>
          <Stack.Screen name="App" component={Tabs}/>
          <Stack.Screen name={ `${currentSong}` } component={SongGUI}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Button
        onPress={() => ref.current && ref.current.navigate(`${currentSong}`)}
        title={ `${currentSong}` }
      />
    </SafeAreaView>
  );
}

function Mian() {
  const ref = useRef(null); 

  return (
    <SafeAreaView>
      <NavigationContainer ref={ref}>
        <Stack.Navigator initialRouteName='Songs'>
          <Stack.Screen name="Songs" component={() => <View></View>}/>
          <Stack.Screen name={ currentSong } component={SongGUI}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Button
        onPress={() => ref.current && ref.current.navigate({ currentSong })}
        title={ currentSong }
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
  },
  scrollView: {
    marginHorizontal: 20
  },
});

export { styles };