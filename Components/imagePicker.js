import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

const ImageSelector = ({ image, setImage }) => {

    const verifyPermission = async () => {
        const result = await Permissions.askAsync(Permissions.CAMERA, Permissions.MEDIA_LIBRARY); // it just ask the permission for first time if user denied then it will automatically save the result of user and use that in future.
        if (result.status !== 'granted') {
            Alert.alert('Insufficient Permissions', 'You need grant camera permission to use this app!', [{ text: 'Okay' }]);
            return false;
        }
        return true;
    }

    const takeImageHandler = async () => {
        // const result = await verifyPermission();
        // if (!result) return;
        const image = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [8, 8],
            quality: 0.5,
        });
        // console.log(image);
        if (!image.cancelled) {
            setImage(image.uri);
        }
    }

    const chooseImageHandler = async () => {
        // const result = await verifyPermission();
        // if (!result) return;
        const image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [8, 8],
            quality: 0.5,
        });
        // console.log(image);
        if (!image.cancelled) {
            setImage(image.uri);
        }
    }


    return (
        <View style={styles.imagePicker}>
            <View style={styles.imageView}>
                {!image ?
                    <Ionicons name='person-circle-outline' size={80} color={COLORS.primary} /> :
                    <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
                }
            </View>
            <View style={styles.butRow}>
                <TouchableOpacity onPress={chooseImageHandler} style={{ ...styles.button, backgroundColor: COLORS.primary, }} activeOpacity={0.6}>
                    <Ionicons name='image-sharp' size={22} color={COLORS.lightGray} />
                </TouchableOpacity>
                <Text style={styles.orText}>-or-</Text>
                <TouchableOpacity onPress={takeImageHandler} style={{ ...styles.button, backgroundColor: COLORS.secondary }} activeOpacity={0.6}>
                    <Ionicons name='camera-sharp' size={22} color={COLORS.lightGray} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    imagePicker: {
        alignItems: 'center',
        paddingVertical: 10
    },
    imageView: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
        marginBottom: 5,
        borderWidth: 1,
        borderColor: COLORS.lightBlue,
        borderRadius: 100
    },
    image: {
        width: '100%',
        borderRadius: 100,
        height: '100%'
    },
    butRow: {
        width: '60%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100
    },
    orText: {
        fontSize: FONTS.body3.fontSize,
        fontFamily: FONTS.body3.fontFamily,
        color: COLORS.gray
    }
});

export default ImageSelector
