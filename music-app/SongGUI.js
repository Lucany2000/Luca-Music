import { play, pause, resume, repeat, skip, back} from './AudioProvider.js';
import { styles } from './App.js';
import { StyleSheet, StatusBar, Button, View, Text} from 'react-native';

export default function SongGUI() {
    return (
    <View style={styles.container}>
        <Text>To share a photo from your phone with a friend, just press the button below!</Text>
    </View>
  );
};