import { Audio } from 'expo-av';
import { StyleSheet, StatusBar, Button, View} from 'react-native';
import { styles } from './App.js';

const sound = new Audio.Sound();
//let isPaused = false;
let onPlaybackStatusUpdate = async (playbackStatus) => {
  if (playbackStatus.didJustFinish) {
    await sound.unloadAsync();
  }
}
async function play(song) {
    console.log(song);
    try {
      await sound.unloadAsync();
    } finally {
      await sound.loadAsync({uri: song}, initialStaus = {});
      sound.setStatusAsync({progressUpdateIntervalMillis: 1000});
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }          
    await sound.playAsync();
    //SongGUI();
}

async function pause() {
  //isPaused = true;
  await sound.pauseAsync();
}

async function resume() {
  //isPaused = false;
  await sound.playAsync();
}

async function repeat() {
  await sound.replayAsync();
}

async function skip(song) {
  //song will be the next item in the array
  play(song);
}

async function back(song) {
  //song will be the prev item in the array 
  play(song);
}

// function SongGUI() {
//   return (
//     <View style={styles.container}>
//       <Button title="Playing Sound"/>
//     </View>
//   );
// }

export { play, pause, resume, repeat, skip, back};