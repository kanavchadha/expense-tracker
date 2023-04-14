import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import React from 'react'
import { FONTS, COLORS, MONTHS } from '../constants';

const renderOptions = (statusOptions) => {
    if (!statusOptions) {
        return [
            <Picker.Item key='1' label='ALL' value='all' />,
            <Picker.Item key='2' label='PAID' value='true' />,
            <Picker.Item key='3' label='UNPAID' value='false' />
        ]
    } else {
        if (!Array.isArray(statusOptions)) return <Picker.Item key='1' label='None' value='' />
        return statusOptions.map(option => <Picker.Item key={option.id} label={option.label} value={option.value} />)
    }
}

const OptionsBar = ({ status, setStatus, statusOptions, onPressDownload, month, setMonth, filter, setFilter, filters, iconBtn, summaryIcon, onPressSummary }) => {

    return (
        <View style={styles.extraSection}>
            {
                (status !== null && status !== undefined) &&
                <View style={styles.dropdown}>
                    <Picker
                        selectedValue={status}
                        mode='dropdown'
                        style={{ color: COLORS.secondary, marginBottom: -15, ...FONTS.body3 }}
                        dropdownIconColor={COLORS.secondary}
                        onValueChange={(itemValue) => setStatus(itemValue)}
                    >
                        {renderOptions(statusOptions).map(option => option)}
                    </Picker>
                </View>
            }
            {
                (month !== null && month !== undefined) &&
                <View style={styles.dropdown}>
                    <Picker
                        selectedValue={month}
                        mode='dropdown'
                        style={{ color: COLORS.secondary, marginBottom: -15, ...FONTS.body3 }}
                        onValueChange={(itemValue) => setMonth(itemValue)}
                    >
                        {MONTHS.map(month => <Picker.Item key={month.id} label={month.value} value={month.id} />)}
                    </Picker>
                </View>
            }
            {
                filters &&
                <View style={styles.dropdown}>
                    <Picker
                        selectedValue={filter}
                        mode='dropdown'
                        style={{ color: COLORS.secondary, marginBottom: -15, ...FONTS.body3 }}
                        onValueChange={(itemValue) => setFilter(itemValue)}
                    >
                        {filters.map(item => <Picker.Item key={item.id} label={item.label} value={item.value} />)}
                    </Picker>
                </View>
            }
            {
                (summaryIcon !== null && summaryIcon !== undefined) &&
                <TouchableOpacity activeOpacity={0.5} onPress={onPressSummary} style={{ marginRight: 5 }}>
                    {iconBtn ?
                        <Ionicons name={summaryIcon} size={30} color={COLORS.secondary} /> :
                        <View style={styles.downloadBtn}>
                            <Text style={styles.downloadBtnText}>Summary</Text>
                            <Ionicons name={summaryIcon} size={16} color={COLORS.lightGray} />
                        </View>
                    }
                </TouchableOpacity>
            }
            <TouchableOpacity activeOpacity={0.5} onPress={onPressDownload}>
                {iconBtn ?
                    <Ionicons name='arrow-down-circle' size={35} color={COLORS.secondary} /> :
                    <View style={styles.downloadBtn}>
                        <Text style={styles.downloadBtnText}>Download</Text>
                        <Ionicons name='download-sharp' size={16} color={COLORS.lightGray} />
                    </View>
                }
            </TouchableOpacity>
        </View>
    )
}

export default OptionsBar

const styles = StyleSheet.create({
    downloadBtn: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    },
    downloadBtnText: {
        fontFamily: FONTS.h4.fontFamily,
        fontSize: FONTS.h4.fontSize,
        marginRight: 5,
        color: COLORS.white,
    },
    extraSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 5,
        flex: 1
    },
    dropdown: {
        padding: 0,
        color: COLORS.secondary,
        borderBottomColor: COLORS.secondary,
        borderBottomWidth: 1,
        borderRadius: 5,
        flex: 1
    }
})