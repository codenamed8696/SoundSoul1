import React from 'react';
import { Modal, View, Text, StyleSheet, Button, Linking, ScrollView } from 'react-native';

const helplines = [
  { name: 'Tele-Manas (Govt. of India)', phone: '14416' },
  { name: 'Vandrevala Foundation', phone: '9999666555' },
  { name: 'Aasra', phone: '9820466728' },
  { name: 'iCALL (TISS)', phone: '02225521111' },
  { name: 'One Life', phone: '7893078930' },
  { name: 'Jeevan Aastha Helpline', phone: '18002333330' },
];

interface CrisisModalProps {
  visible: boolean;
  onClose: () => void;
}

const CrisisModal: React.FC<CrisisModalProps> = ({ visible, onClose }) => {
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>It's okay to ask for help.</Text>
          <Text style={styles.modalText}>
            It sounds like you are going through a difficult time. Please consider reaching out to a professional who can support you. Here are some resources available in India.
          </Text>
          <ScrollView style={styles.scrollView}>
            {helplines.map((helpline) => (
              <View key={helpline.name} style={styles.helplineItem}>
                <Text style={styles.helplineName}>{helpline.name}</Text>
                <Button title={`Call ${helpline.phone}`} onPress={() => handleCall(helpline.phone)} />
              </View>
            ))}
          </ScrollView>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  helplineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  helplineName: {
    fontSize: 16,
    flex: 1,
  },
});

export default CrisisModal;