import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState([
    { id: '1', title: 'Maintenance Work', message: 'Water maintenance on Main Street tomorrow 9AM-5PM', date: '2024-01-15' },
    { id: '2', title: 'Service Update', message: 'New reporting system now available', date: '2024-01-14' },
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const addAnnouncement = () => {
    if (newTitle && newMessage) {
      setAnnouncements([{ id: Date.now().toString(), title: newTitle, message: newMessage, date: new Date().toISOString().split('T')[0] }, ...announcements]);
      setNewTitle('');
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Announcements</Text>
      
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Announcement Title" value={newTitle} onChangeText={setNewTitle} />
        <TextInput style={styles.textArea} placeholder="Announcement Message" value={newMessage} onChangeText={setNewMessage} multiline />
        <TouchableOpacity style={styles.addButton} onPress={addAnnouncement}>
          <Text style={styles.addButtonText}>Add Announcement</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={announcements}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.announcementCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  inputContainer: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, height: 80, textAlignVertical: 'top', marginBottom: 10 },
  addButton: { backgroundColor: '#3498db', padding: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  announcementCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  date: { fontSize: 12, color: '#7f8c8d', marginTop: 5 },
  message: { fontSize: 14, color: '#34495e', marginTop: 10 }
});