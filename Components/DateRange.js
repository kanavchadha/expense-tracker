import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { showToastMessage } from "../helpers";
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from "../constants";

const DateRange = ({ fromDate, toDate, setFromDate, setToDate }) => {

    const openDatePicker = (ds) => {
        DateTimePickerAndroid.open({
            value: ds === 'to' ? toDate : fromDate,
            is24Hour: true,
            timeZoneOffsetInMinutes: -330,
            onChange: (event, value) => {
                if (ds === 'to') {
                    value.setUTCHours(23,59,59);
                    if (value.getTime() < fromDate.getTime()) {
                        return showToastMessage('Please select valid Input!', 'top', 'long');
                    }
                    setToDate(value);
                } else {
                    value.setUTCHours(0,0,0);
                    if (toDate.getTime() < value.getTime()) {
                        return showToastMessage('Please select valid Input!', 'top', 'long');
                    }
                    setFromDate(value);
                }
                // console.log(value, value.toISOString());
            }
        });
    }

    return (
        <View style={styles.row}>
            <TouchableOpacity onPress={() => openDatePicker('from')} activeOpacity={0.8} style={{ flex: 1 }}>
                <View>
                    <Text style={styles.dateLabel}>From: </Text>
                    <View style={styles.dateInput}>
                        <Text style={styles.dateText} numberOfLines={1}>{fromDate.toUTCString().split('00:')[0]}</Text>
                        <Ionicons name='caret-down' color={COLORS.primary} />
                    </View>
                </View>
            </TouchableOpacity>
            <Ionicons name='arrow-forward-sharp' size={26} color={COLORS.secondary} style={{ paddingHorizontal: 4, marginTop: 15 }} />
            <TouchableOpacity onPress={() => openDatePicker('to')} activeOpacity={0.8} style={{ flex: 1 }}>
                <View>
                    <Text style={styles.dateLabel}>To: </Text>
                    <View style={styles.dateInput}>
                        <Text style={styles.dateText} numberOfLines={1}>{toDate.toUTCString().split('23:')[0]}</Text>
                        <Ionicons name='caret-down' color={COLORS.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 5
    },
    dateText: {
        fontSize: FONTS.body3.fontSize,
        fontFamily: FONTS.body3.fontFamily,
        color: COLORS.primary
    },
    dateLabel: {
        fontSize: FONTS.h3.fontSize,
        fontFamily: FONTS.h3.fontFamily,
        color: COLORS.secondary,
        paddingHorizontal: 3
    },
    dateInput: {
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
})

export default DateRange;