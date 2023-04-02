import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants';

export default InvestmentSummary = ({ data, selectedCategory, setSelectedCategory, status, totalReturns, totalInvestment }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                flexDirection: 'row',
                height: status === 'all' ? 45 : 40,
                paddingHorizontal: SIZES.base,
                borderRadius: 10,
                backgroundColor: (selectedCategory === item.name) ? item.color : COLORS.white
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
                <Text numberOfLines={1} style={{ marginLeft: SIZES.base, color: (selectedCategory === item.name) ? COLORS.white : COLORS.primary, ...FONTS.h3 }}>{item.name}</Text>
            </View>

            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.primary, ...FONTS.h3 }}>{item.y} Rs - {item.label} ({item.investmentCount})</Text>
                {status === 'all' && <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.darkgray, ...FONTS.body4 }}>  </Text>}
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={{ padding: SIZES.font }}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => `${item.id}`}
            />
            {status !== 'false' && totalIncome > 0 && <Text style={{ marginVertical: 5, color: COLORS.purple, textAlign: 'center', ...FONTS.h3 }}> You spent {(totalExpenditure / totalIncome * 100).toFixed(2)}% of your money in your expenses and you saved {((totalIncome - totalExpenditure) / totalIncome * 100).toFixed(2)}% :).</Text>}
        </View>
    )
}


export const SummaryHeader = ({ status, monthlyIncome, totalExpenditure, expenseCount, summaryDetails }) => {
    const incomeAmount = monthlyIncome?.total ? monthlyIncome.total : 0;
    const savings = status==='all' && summaryDetails ? monthlyIncome.paidAmount - summaryDetails.paidExpenseTotal : status === 'true' ? incomeAmount - totalExpenditure : 0;
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', flex: 1, paddingHorizontal: 10, marginTop: SIZES.base }}>
            <View>
                <Text numberOfLines={1} style={{ ...FONTS.h3, letterSpacing: 1, color: COLORS.darkgreen }}>{status === 'true' ? 'Income' : status === 'false' ? 'Pending Income' : 'Total Income'} </Text>
                <View style={{ ...styles.resHeading, borderColor: COLORS.darkgreen, backgroundColor: COLORS.darkgreen }} />
                <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.darkgreen }}> {incomeAmount} Rs {monthlyIncome?.count ? `(${monthlyIncome?.count})` : ''}</Text>
                { status === 'all' && !!summaryDetails && 
                    <View>
                        {!!monthlyIncome.paidAmount && <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.darkgray }}> {monthlyIncome.paidAmount}Rs ({monthlyIncome.paidCount}) P </Text>}
                        {!!monthlyIncome.unpaidAmount && <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.lightBlue }}> {monthlyIncome.unpaidAmount}Rs ({monthlyIncome.unpaidCount}) U </Text>}
                    </View>
                }
            </View>
            {(status === 'true' || ( status==='all' && monthlyIncome?.paidAmount > 0 )) &&
                <View>
                    <Text numberOfLines={1} style={{ ...FONTS.h3, letterSpacing: 1, color: COLORS.primary }}>Savings </Text>
                    <View style={{ ...styles.resHeading, borderColor: COLORS.primary, backgroundColor: COLORS.primary }} />
                    <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.primary }}>{savings ? savings : 0} Rs </Text>
                </View>
            }
            <View>
                <Text numberOfLines={1} style={{ ...FONTS.h3, letterSpacing: 1, color: COLORS.secondary }}>Expenditure </Text>
                <View style={{ ...styles.resHeading, borderColor: COLORS.secondary, backgroundColor: COLORS.secondary }} />
                <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.secondary }}>{totalExpenditure} Rs {expenseCount ? `(${expenseCount})` : ''} </Text>
                { status === 'all' && !!summaryDetails && 
                    <View>
                        {!!summaryDetails.paidExpenseTotal && <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.darkgray }}> {summaryDetails.paidExpenseTotal}Rs ({summaryDetails.paidExpenseCount}) P </Text>}
                        {!!summaryDetails.unpaidExpenseTotal && <Text numberOfLines={1} style={{ ...FONTS.body4, textAlign: 'center', color: COLORS.lightBlue }}> {summaryDetails.unpaidExpenseTotal}Rs ({summaryDetails.unpaidExpenseCount}) U </Text>}
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