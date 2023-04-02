import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SummaryModal } from '../SummaryModal';
import { getInvestmentById } from '../../DB';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, investmentCategoryOptions } from '../../constants';

const getCategoryData = (category) => {
    return investmentCategoryOptions.find(cat => cat.value === category);
}

const InvestmentDetailsModal = ({ id, setShowDetails }) => {
    const [investment, setInvestment] = useState(null);
    const [loading, setLoading] = useState(false);

    const categoryData = investment ? getCategoryData(investment.category) : {};
    const invesmentsArr = investment ? JSON.parse(investment.investments) : [];
    const returnsArr = investment ? JSON.parse(investment.returns) : [];

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        getInvestmentById(id).then(res => {
            const investment = res.rows?._array[0];
            if (!investment) throw new Error('Data not found!');
            setInvestment(investment);
            setLoading(false);
        }).catch(err => {
            showToastMessage('Error occured while finding Investment!');
            console.log(err.message);
            setLoading(false);
        })
    }, [id])

    return (
        <SummaryModal modalVisible={id ? true : false} setModalVisible={() => { setShowDetails(null) }} title='Investment Details'>
            {
                loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                    investment &&
                    <ScrollView>
                        <View style={{ flexDirection: 'row', padding: SIZES.padding, paddingTop: 8, alignItems: 'center' }}>
                            <View
                                style={{
                                    height: 60,
                                    width: 60,
                                    borderRadius: 26,
                                    backgroundColor: COLORS.lightGray,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: SIZES.base
                                }}
                            >
                                <Image
                                    source={categoryData.icon}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Text style={{ ...FONTS.h3, color: categoryData.color }}>{investment.category}</Text>
                                <Text style={{ ...FONTS.body4, color: COLORS.lightBlue }}> {new Date(investment.startDate.split(' ')[0]).toDateString()} </Text>
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: SIZES.padding }}>
                            <Text style={{ ...FONTS.h2, color: COLORS.primary, marginBottom: 3, marginTop: -10 }} numberOfLines={1}>{investment.title}</Text>
                            <Text style={{ ...FONTS.body3, color: COLORS.darkgray }} numberOfLines={3}>
                                {investment.reference}
                            </Text>
                            <View style={styles.row}>
                                <Text style={{ ...FONTS.h3, color: categoryData.color, flex: 0.5 }} numberOfLines={2}>
                                    Time Period: <Text style={{ color: COLORS.darkgray }}>{investment.timePeriod}</Text>
                                </Text>
                                <Text style={{ ...FONTS.h3, color: categoryData.color, flex: 0.5 }} numberOfLines={2}>
                                    Status: <Text style={{ color: COLORS.darkgray }}>{investment.isActive === 'true' ? 'Active' : 'Matured'}</Text>
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={{ ...FONTS.h3, color: categoryData.color, flex: 0.5 }} numberOfLines={2}>
                                    Investment: <Text style={{ color: COLORS.darkgray }}>{investment.totalInvAmount} Rs</Text>
                                </Text>
                                <Text style={{ ...FONTS.h3, color: categoryData.color, flex: 0.5 }} numberOfLines={2}>
                                    Returns: <Text style={{ color: COLORS.darkgray }}>{investment.totalRetAmount} Rs</Text>
                                </Text>
                            </View>
                            <View>
                                <View style={styles.row}>
                                    <Text style={{ ...FONTS.h3, color: COLORS.danger }} >Investments:</Text>
                                    <Text style={{ ...FONTS.h3, color: COLORS.danger }} numberOfLines={1}> {invesmentsArr.length} </Text>
                                </View>
                                {invesmentsArr.map(inv =>
                                    <View style={{...styles.dataRow, borderColor: COLORS.danger}} key={inv.id}>
                                        <Text style={{ ...FONTS.h3, color: COLORS.danger }}>
                                            Date: <Text style={{ color: COLORS.darkgray }}>{new Date(inv.date)?.toDateString()}</Text>
                                        </Text>
                                        <Text style={{ ...FONTS.h3, color: COLORS.danger }}>
                                            Amount: <Text style={{ color: COLORS.darkgray }}>{inv.amount} Rs</Text>
                                        </Text>
                                        <Text style={{ ...FONTS.h3, color: COLORS.danger }}>
                                            Interest: <Text style={{ color: COLORS.darkgray }}>{inv.interest}%</Text>
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View>
                                <View style={styles.row}>
                                    <Text style={{ ...FONTS.h3, color: COLORS.darkgreen }}>Returns:</Text>
                                    <Text style={{ ...FONTS.h3, color: COLORS.darkgreen }} numberOfLines={1}> {returnsArr.length} </Text>
                                </View>
                                {returnsArr.map(ret =>
                                    <View style={{...styles.dataRow, borderColor: COLORS.darkgreen}} key={ret.id}>
                                        <Text style={{ ...FONTS.h3, color: COLORS.darkgreen }}>
                                            Date: <Text style={{ color: COLORS.darkgray }}>{new Date(ret.date)?.toDateString()}</Text>
                                        </Text>
                                        <Text style={{ ...FONTS.h3, color: COLORS.darkgreen }}>
                                            Amount: <Text style={{ color: COLORS.darkgray }}>{ret.amount} Rs</Text>
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

            }
        </SummaryModal>
    )
}

const styles = StyleSheet.create({
    row: {
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dataRow: {
        borderColor: COLORS.lightBlue,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 3,
        marginHorizontal: 3,
        padding: 6

    }
})

export default InvestmentDetailsModal;