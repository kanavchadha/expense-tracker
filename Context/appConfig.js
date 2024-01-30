import { createContext, useState, useEffect } from "react";
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppConfigContext = createContext();

const AppConfigContextProvider = (props) => {
    const [invInSumm, setInvInSumm] = useState(true);
    const [createInvExp, setCreateInvExp] = useState(true);
    const [createRetInc, setCreateRetInc] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);

    useEffect(() => {
        getAppConfigs().then(data=>{
            if(!data) return;
            setInvInSumm(data.invInSumm);
            setCreateInvExp(data.createInvExp);
            setCreateRetInc(data.createRetInc);
            setDarkTheme(data.darkTheme);
        }).catch(err => {
            console.log(err.message);
            Alert.alert('Something Went Wrong!', 'Error occured while reading data. Please retry after resatrting the App. ' + e.message);
        })
    }, []);

    const getAppConfigs = async () => {
        const jsonValue = await AsyncStorage.getItem('appConfigs')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    }

    const storeAppConfigs = async () => {
        try {
            const value = {
                invInSumm,
                createInvExp,
                createRetInc,
                darkTheme
            }
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem('appConfigs', jsonValue);
            return { success: true };
        } catch (e) {
            Alert.alert('Something Went Wrong!', 'Error occured while saving data. Please retry after resatrting the App. ' + e.message);
            return { err: e.message };
        }
    }

    return (
        <AppConfigContext.Provider value={{
            saveAppConfigs: storeAppConfigs,
            invInSumm, setInvInSumm,
            createInvExp, setCreateInvExp,
            createRetInc, setCreateRetInc,
            darkTheme, setDarkTheme,
        }}>
            {props.children}
        </AppConfigContext.Provider>
    )
}

export default AppConfigContextProvider;