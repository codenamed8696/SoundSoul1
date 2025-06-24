//
// NAME: components/common/CrisisModal.tsx
//
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Button, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';

// Disclaimer: This is a sample list for India. For a production app, you MUST
// verify, expand, and maintain this list.
const helplines = {
    'IN': [ // India
        { name: 'Vandrevala Foundation', phone: '9999666555' },
        { name: 'iCall', phone: '02225521111' },
        { name: 'AASRA', phone: '9820466726' },
        { name: 'National Suicide Prevention Lifeline (KIRAN)', phone: '18005990019'}
    ],
    'US': [ // United States
        { name: 'National Suicide Prevention Lifeline', phone: '988' }
    ],
    'GB': [ // United Kingdom
        { name: 'Samaritans', phone: '116123' }
    ],
    'DEFAULT': [
        { name: 'Befrienders Worldwide', phone: 'Visit befrienders.org' }
    ]
};

type Helpline = { name: string; phone: string };

const CrisisModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [relevantHelplines, setRelevantHelplines] = useState<Helpline[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied. Showing default resources.');
                    setRelevantHelplines(helplines['DEFAULT']);
                    setLoading(false);
                    return;
                }

                try {
                    let location = await Location.getCurrentPositionAsync({});
                    setLocation(location);
                    
                    let geocode = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });

                    const countryCode = geocode[0]?.isoCountryCode;
                    if (countryCode && helplines[countryCode as keyof typeof helplines]) {
                        setRelevantHelplines(helplines[countryCode as keyof typeof helplines]);
                    } else {
                        setRelevantHelplines(helplines['DEFAULT']);
                    }

                } catch(e) {
                    setErrorMsg('Could not determine location. Showing default resources.');
                    setRelevantHelplines(helplines['DEFAULT']);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [visible]);

    const handleCall = (phoneNumber: string) => {
        if (phoneNumber.startsWith('Visit')) return; // Not a phone number
        Linking.openURL(`tel:${phoneNumber}`);
    }

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
                        It sounds like you are going through a difficult time. Please consider reaching out to one of the resources below for immediate support.
                    </Text>
                    {loading && <ActivityIndicator size="large" color="#007AFF" />}
                    {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                    {!loading && relevantHelplines.map((line, index) => (
                        <View key={index} style={styles.helplineContainer}>
                           <Text style={styles.helplineName}>{line.name}:</Text>
                           <Text style={styles.helplinePhone} onPress={() => handleCall(line.phone)}>{line.phone}</Text>
                        </View>
                    ))}
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
    },
    helplineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    helplineName: {
        fontSize: 16,
        fontWeight: '500',
    },
    helplinePhone: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    errorText: {
        color: 'red',
        marginVertical: 10,
    }
});

export default CrisisModal;