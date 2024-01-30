import { createContext, useState, useEffect } from "react";
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../helpers';

export const UserContext = createContext();

const UserContextProvider = (props) => {
    const [name, setName] = useState('anonymous');
    const [image, setImage] = useState('https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Download-Image.png');
    const [notification, setNotification] = useState('EveryDay');

    useEffect(() => {
        getUserData().then(userInfo => {
            if (!userInfo) return;
            setName(userInfo.name);
            setImage(userInfo.image);
            setNotification(userInfo.notification);
        }).catch(err => {
            console.log(err.message);
            Alert.alert('Something Went Wrong!', 'Error occured while reading data. Please retry after resatrting the App. ' + e.message);
        })
    }, []);

    const storeData = async () => {
        try {
            const value = {
                name, image, notification
            }
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('userInfo', jsonValue);
            return { success: true };
        } catch (e) {
            Alert.alert('Something Went Wrong!', 'Error occured while saving data. Please retry after resatrting the App. ' + e.message);
            return { err: e.message };
        }
    }

    return (
        <UserContext.Provider value={{
            userName: name,
            userImage: image,
            notification: notification,
            setName: setName,
            setImage: setImage,
            setNotification: setNotification,
            saveUserData: storeData
        }}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserContextProvider;