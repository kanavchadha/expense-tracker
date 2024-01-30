import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, icons } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../Context/user';
import { Ionicons } from '@expo/vector-icons';
import { getMonthlyExpenseAnalysis } from '../DB';

export default Header = ({ month, setModalVisible }) => {
    const { navigate } = useNavigation();
    const { userName } = useContext(UserContext);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        getMonthlyExpenseAnalysis(month).then(res => {
            const { currMonthRes, prevMonthRes } = res;
            if (!currMonthRes.total || !prevMonthRes.total) {
                setAnalysis(null);
            } else {
                const expensePercent = ((currMonthRes.total - prevMonthRes.total) / prevMonthRes.total) * 100;
                setAnalysis(expensePercent.toFixed(2));
            }
        }).catch(err => {
            console.log(err.message);
        })
    }, [month]);

    return (
        <View style={{ paddingHorizontal: SIZES.padding, paddingTop: SIZES.padding, paddingBottom: SIZES.paddingS,  backgroundColor: COLORS.white }}>
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.primary, ...FONTS.h2, fontSize: 20 }}> Hi, {userName} </Text>
                    <TouchableOpacity onPress={() => { setModalVisible(true) }} activeOpacity={0.3}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ ...FONTS.h4, color: COLORS.darkgray }}> Here's your Expenses Summary... </Text>
                            <Ionicons name="chevron-forward" size={15} color={COLORS.darkgray} style={{ paddingTop: 2 }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ backgroundColor: COLORS.secondary, padding: 10, borderRadius: 50 }} onPress={() => navigate('Search')}>
                    <Ionicons name="search" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        backgroundColor: COLORS.lightGray,
                        height: 50,
                        width: 50,
                        borderRadius: 25,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Image
                            source={icons.calendar}
                            style={{
                                width: 25,
                                height: 25,
                                tintColor: COLORS.purple
                            }}
                        />
                    </View>

                    <View style={{ marginLeft: SIZES.radius }}>
                        <Text style={{ color: COLORS.purple, ...FONTS.h3 }}>{new Date().toDateString()}</Text>
                        {
                            analysis !== null &&
                            <Text style={{ ...FONTS.body4, color: COLORS.darkgray }} numberOfLines={1}>
                                {
                                    analysis === 0 ? 'Same as previous month!' :
                                        analysis < 0 ? Math.abs(analysis) + '% Less than last month :)' :
                                            Math.abs(analysis) + "% More than last month!!"
                                }
                            </Text>
                        }
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigate('ExpenseForm', {})} style={{ justifyContent: 'center' }} activeOpacity={0.6}>
                    <Ionicons name='add-circle-outline' size={40} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    )
}