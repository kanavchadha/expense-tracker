import { StyleSheet, Switch, Text, View } from 'react-native'
import FormModal from '../Components/FormModal';
import { useContext } from 'react';
import { COLORS, FONTS, SIZES } from '../constants';
import { AppConfigContext } from '../Context/appConfig';
import { useNavigation } from '@react-navigation/native';

const AppConfigsForm = () => {
    const { goBack } = useNavigation();
    const { saveAppConfigs, invInSumm, setInvInSumm, createInvExp, setCreateInvExp, createRetInc, setCreateRetInc, darkTheme, setDarkTheme } = useContext(AppConfigContext);

    const submit = async () => {
        const { err } = await saveAppConfigs();
        if (err) throw new Error(err);
        goBack();
    }

    return (
        <FormModal title={'App Configurations'} submit={submit} successMsg={'Information Saved Successfully.'} showErrAlert>
            <View style={styles.section}>
                <View style={styles.dividerHeading}>
                    <View style={styles.line} />
                    <Text style={styles.divText}>Expenses</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.option}>
                    <Text style={styles.optionText}>Include Investments in Expense Summary : </Text>
                    <Switch value={invInSumm} onValueChange={(value) => setInvInSumm(value)} thumbColor={invInSumm ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
                </View>
            </View>
            <View style={styles.section}>
                <View style={styles.dividerHeading}>
                    <View style={styles.line} />
                    <Text style={styles.divText}>Investments</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.option}>
                    <Text style={styles.optionText}>Create/Update Expense Records wrt Investment Record : </Text>
                    <Switch value={createInvExp} onValueChange={(value) => setCreateInvExp(value)} thumbColor={createInvExp ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
                </View>
                <View style={styles.option}>
                    <Text style={styles.optionText}>Create/Update Monthly Income Record wrt Return Record : </Text>
                    <Switch value={createRetInc} onValueChange={(value) => setCreateRetInc(value)} thumbColor={createRetInc ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.dividerHeading}>
                    <View style={styles.line} />
                    <Text style={styles.divText}>General</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.option}>
                    <Text style={styles.optionText}>Dark Theme : </Text>
                    <Switch value={darkTheme} onValueChange={(value) => setDarkTheme(value)} thumbColor={darkTheme ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
                </View>
            </View>
        </FormModal>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: SIZES.font,
    },
    dividerHeading: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.radius,
        marginTop: SIZES.base
    },
    line: {
        height: 1,
        flex: 1,
        backgroundColor: COLORS.secondary,
        opacity: 0.5
    },
    divText: {
        paddingHorizontal: 5,
        paddingBottom: 1,
        color: COLORS.primary,
        fontSize: FONTS.h3.fontSize,
        fontFamily: FONTS.h3.fontFamily
    },
    option: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.base,
        paddingHorizontal: SIZES.base
    },
    optionText: {
        flex: 1,
        fontSize: FONTS.body4.fontSize,
        fontFamily: FONTS.body4.fontFamily
    }
})

export default AppConfigsForm;