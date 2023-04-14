import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default InvestmentSummary = ({ data, selectedCategory, setSelectedCategory, status }) => {

    const getSummaryEvaluation = () => {
        const evalData = data.reduce((res, item) => {
            const retInvRatio = (item.retTotal / item.invTotal);
            if (!res.highestReturnRatio || !res.lowestReturnRatio) {
                res.highestReturnRatio = { ratio: retInvRatio, category: item.name }
                res.lowestReturnRatio = { ratio: retInvRatio, category: item.name }
            } else {
                res.highestReturnRatio = (res.highestReturnRatio?.ratio < retInvRatio) ? { ratio: retInvRatio, category: item.name } : res.highestReturnRatio;
                res.lowestReturnRatio = (res.lowestReturnRatio?.ratio > retInvRatio) ? { ratio: retInvRatio, category: item.name } : res.lowestReturnRatio;
            }
            return res;
        }, {});
        if(evalData.highestReturnRatio && evalData.lowestReturnRatio && (evalData.highestReturnRatio.ratio === evalData.lowestReturnRatio.ratio))
            return null;
        return evalData;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                padding: SIZES.base,
                borderRadius: 10,
                backgroundColor: (selectedCategory === item.name) ? item.color : COLORS.white,
                overflow: 'hidden'
            }}
            onPress={() => { setSelectedCategory(item.name === 'Category' ? 'All' : item.name) }}
        >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View
                    style={{
                        width: 20,
                        height: 20,
                        backgroundColor: (selectedCategory === item.name) ? COLORS.white : item.color,
                        borderRadius: 5
                    }}
                />
                <Text numberOfLines={1} style={{ marginLeft: SIZES.base, color: (selectedCategory === item.name) ? COLORS.white : item.color, ...FONTS.h3 }}>{item.name}</Text>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.blue, ...FONTS.h3 }}>{item.invTotal} Rs - {item.invPercent} ({item.invCount})</Text>
                {status === 'all' &&
                    <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.darkgray, ...FONTS.body4 }}>
                        {item.activeInvCount ? `${item.activeInvAmount}Rs (${item.activeInvCount}) A` : ''}
                        {item.activeInvCount && item.inactiveInvCount ? ' | ' : ''}
                        {item.inactiveInvCount ? `${item.inactiveInvAmount}Rs (${item.inactiveInvCount}) M` : ''}
                    </Text>
                }
                <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.danger, ...FONTS.h3 }}>{item.retTotal} Rs - {item.retPercent} ({item.retCount})</Text>
                {status === 'all' &&
                    <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.darkgray, ...FONTS.body4 }}>
                        {item.activeRetCount ? `${item.activeRetAmount}Rs (${item.activeRetCount}) A` : ''}
                        {item.activeRetCount && item.inactiveRetCount ? ' | ' : ''}
                        {item.inactiveRetCount ? `${item.inactiveRetAmount}Rs (${item.inactiveRetCount}) M` : ''}
                    </Text>
                }
            </View>
        </TouchableOpacity>
    )

    const sumEvaluation = getSummaryEvaluation();

    return (
        <View style={{ padding: SIZES.font }}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => `${item.id}`}
            />
            {data.length > 1 && sumEvaluation &&
                <Text style={{ marginVertical: 5, color: COLORS.purple, textAlign: 'center', ...FONTS.h3 }}>
                    You Got Highest Returns in {sumEvaluation?.highestReturnRatio?.category} and Lowest Returns in {sumEvaluation?.lowestReturnRatio?.category}.
                </Text>
            }
        </View>
    )
}


export const SummaryHeader = ({ status, investmentDetails, returnDetails }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', flex: 1, paddingHorizontal: 10, marginTop: SIZES.base }}>
            <View>
                <Text numberOfLines={1} style={{ ...FONTS.h3, letterSpacing: 1, color: COLORS.blue }}>Investment</Text>
                <View style={{ ...styles.resHeading, borderColor: COLORS.darkgreen, backgroundColor: COLORS.blue }} />
                <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.blue }}> {investmentDetails?.totalInvested} Rs {investmentDetails?.allInvestmentsCount ? `(${investmentDetails?.allInvestmentsCount})` : ''}</Text>
                {status === 'all' && !!investmentDetails &&
                    <View>
                        <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.darkgray }}> {investmentDetails?.activeInvestmentsTotal}Rs ({investmentDetails?.activeInvestmentsCount}) A </Text>
                        <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.lightBlue }}> {investmentDetails?.inactiveInvestmentsTotal}Rs ({investmentDetails?.inactiveInvestmentsCount}) M </Text>
                    </View>
                }
            </View>
            <View>
                <Text numberOfLines={1} style={{ ...FONTS.h3, letterSpacing: 1, color: COLORS.danger }}>Return </Text>
                <View style={{ ...styles.resHeading, borderColor: COLORS.secondary, backgroundColor: COLORS.danger }} />
                <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.danger }}>{returnDetails?.totalReturns} Rs {returnDetails?.allReturnsCount ? `(${returnDetails?.allReturnsCount})` : ''} </Text>
                {status === 'all' && !!returnDetails &&
                    <View>
                        <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.darkgray }}> {returnDetails?.activeReturnsTotal}Rs ({returnDetails?.activeReturnsCount}) A </Text>
                        <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.lightBlue }}> {returnDetails?.inactiveReturnsTotal}Rs ({returnDetails?.inactiveReturnsCount}) M </Text>
                    </View>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    resHeading: {
        height: 8,
        zIndex: -1,
        borderWidth: 0.1,
        borderRadius: 20,
        marginTop: -7,
        opacity: 0.36
    }
})