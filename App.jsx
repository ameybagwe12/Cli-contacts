import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  FlatList,
  StatusBar,
  PermissionsAndroid,
} from 'react-native';
import Contacts from 'react-native-contacts';
import BackgroundFetch from 'react-native-background-fetch';
import {Provider} from 'react-redux';
import {setContacts} from './contactSlice';
import store from './store';

const App = () => {
  const [myContacts, setMyContacts] = useState([]);

  useEffect(() => {
    // Initialize BackgroundFetch when component mounts.
    initBackgroundFetch();
  }, []);

  const initBackgroundFetch = async () => {
    // BackgroundFetch event handler.
    const onEvent = async taskId => {
      console.log('[BackgroundFetch] task: ', taskId);
      await fetchContacts();
      BackgroundFetch.finish(taskId);
    };

    // Timeout callback is executed when your Task has exceeded its allowed running-time.
    const onTimeout = async taskId => {
      console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
      BackgroundFetch.finish(taskId);
    };

    let status = await BackgroundFetch.configure(
      {minimumFetchInterval: 1},
      onEvent,
      onTimeout,
    );
    console.log('[BackgroundFetch] configure status: ', status);
  };

  const fetchContacts = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'Please accept bare mortal',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Contacts.getAll()
          .then(contacts => {
            setMyContacts(contacts);
            store.dispatch(setContacts(contacts));
            const newContactLength = contacts.length;
            console.log('Contacts Total: ', newContactLength);
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        console.log('Contacts permission denied');
      }
    } catch (error) {
      console.error('Permission error: ', error);
    }
  };

  return (
    <>
      <Provider store={store}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>BackgroundFetch Demo</Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.sectionContainer}>
            <FlatList
              data={myContacts}
              renderItem={({item}) => <Text>{item.displayName}</Text>}
              keyExtractor={item => item.recordID}
            />
          </View>
        </SafeAreaView>
      </Provider>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#FFFFFF',
  },
  body: {
    backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
});

export default App;
