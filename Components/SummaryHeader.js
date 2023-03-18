import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTS, COLORS, SIZES } from '../constants';


const SummaryHeader = ({ status, monthlyIncome, totalExpenditure, expenseCount, summaryDetails }) => {
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

export default SummaryHeader;

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