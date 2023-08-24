import { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native'
import { FONTS, COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { showToastMessage } from '../helpers';

const FormModal = (props) => {
    const [loading, setLoading] = useState(false);
    const { goBack } = useNavigation();
    const scrollContainer = useRef(null);
    const disableBtn = props.disableBtn ? props.disableBtn : false;

    const submitForm = async () => {
        if(scrollContainer.current) scrollContainer.current.scrollToEnd();
        try {
            setLoading(true);
            await props.submit();
            setLoading(false);
            showToastMessage(props.successMsg, 'top');
        } catch (err) {
            showToastMessage('Error Occured! Please try again.');
            setLoading(false);
            if (props.showErrAlert) {
                Alert.alert('Something Went Wrong!', 'Error occured while saving data: ' + err.message);
            }
        }
    }

    return (
        <View style={styles.centeredView}>
            <View style={styles.backdrop} onTouchEnd={goBack} />
            <Text style={styles.title} numberOfLines={2}>{props.title}</Text>
            <View style={styles.form}>
                <ScrollView ref={scrollContainer}>
                    {props.children}
                </ScrollView>
                <View>
                    <TouchableOpacity activeOpacity={0.8} onPress={submitForm} disabled={(loading || disableBtn)}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>{props.submitBtnText ? props.submitBtnText : 'Submit'}</Text>
                            {loading && <ActivityIndicator color={COLORS.lightGray} style={{ marginLeft: 6 }} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default FormModal;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        height: Dimensions.get('screen').height,
        justifyContent: "center",
        alignItems: 'center'
    },
    backdrop: {
        position: 'absolute',
        flex: 1,
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    title: {
        fontSize: FONTS.h1.fontSize,
        fontFamily: FONTS.h1.fontFamily,
        color: COLORS.lightGray,
        textAlign: 'center',
        position: 'relative',
        top: 5,
        letterSpacing: 2,
        textShadowOffset: { width: 2, height: 2 },
        textShadowColor: COLORS.peach,
        textShadowRadius: 3,
        zIndex: 10
    },
    form: {
        width: '95%',
        minheight: 200,
        maxHeight: 436,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: COLORS.secondary,
        borderRadius: 15,
        zIndex: 5,
        shadow: {
            shadowColor: "#000",
            shadowOffset: {
                width: 2,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 3
        },
        justifyContent: 'space-between'
    },
    button: {
        backgroundColor: COLORS.primary,
        marginTop: 15,
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.lightGray,
        fontFamily: FONTS.h3.fontFamily,
        fontSize: FONTS.h3.fontSize,
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        textAlignVertical: 'center',
        textAlign: 'center',
        textShadowOffset: { width: 1, height: 1 },
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowRadius: 2,
    }
})