import { StyleSheet, Text, View, Image, TouchableOpacity, } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, investmentCategoryOptions } from '../../constants';

const getCategoryData = (category) => {
    return investmentCategoryOptions.find(cat => cat.value === category);
}

const InvestmentCard = ({ id, title, category, reference, timePeriod, startDate, totalInvested, totalReturns, status, index, editInvestment, deleteInvestment, copyInvestment, showDetails }) => {
    return (
        <View style={{
            ...styles.card,
            ...styles.shadow,
            marginLeft: index == 0 ? SIZES.padding : 0
        }}>
            <View style={{ flexDirection: 'row', padding: SIZES.padding, alignItems: 'center' }}>
                <View
                    style={{
                        height: 50,
                        width: 50,
                        borderRadius: 25,
                        backgroundColor: COLORS.lightGray,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: SIZES.base
                    }}
                >
                    <Image
                        source={getCategoryData(category).icon}
                        style={{
                            width: 30,
                            height: 30,
                        }}
                    />
                </View>
                <View style={{ alignSelf: 'flex-end' }}>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color }}>{category}</Text>
                    <Text style={{ ...FONTS.body4, color: COLORS.lightBlue }}> {new Date(startDate.split(' ')[0]).toDateString()} </Text>
                </View>
                {/* Actions */}
                <View style={{ position: 'absolute', right: 10 }}>
                    <TouchableOpacity onPress={() => copyInvestment(id)} style={styles.iconButton}>
                        <FontAwesome name='copy' size={16} color={COLORS.darkYellow} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editInvestment(id)} style={styles.iconButton}>
                        <FontAwesome name='pencil' size={16} color={COLORS.peach} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteInvestment(id)} style={styles.iconButton}>
                        <FontAwesome name='trash' size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: SIZES.padding, flex: 1 }}>
                <Text style={{ ...FONTS.h2, color: COLORS.primary, marginBottom: 3, marginTop: -10 }} numberOfLines={1}>{title}</Text>
                <Text style={{ ...FONTS.body3, color: COLORS.darkgray }} numberOfLines={3}>
                    {reference}
                </Text>
                <View style={styles.row}>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color, flex: 0.5 }} numberOfLines={2}>
                        Time Period: <Text style={{color: COLORS.darkgray}}>{timePeriod}</Text>
                    </Text>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color, flex: 0.5 }} numberOfLines={2}>
                        Status: <Text style={{color: COLORS.darkgray}}>{status === 'true' ? 'Active' : 'Matured'}</Text>
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color, flex: 0.5 }} numberOfLines={2}>
                        Investment: <Text style={{color: COLORS.darkgray}}>{totalInvested}</Text>
                    </Text>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color, flex: 0.5 }} numberOfLines={2}>
                        Returns: <Text style={{color: COLORS.darkgray}}>{totalReturns}</Text>
                    </Text>
                </View>
            </View>
            <TouchableOpacity activeOpacity={0.6} onPress={() => showDetails(id)}>
                <View style={{ ...styles.priceView, backgroundColor: getCategoryData(category).color }}>
                    <Text style={{ color: COLORS.white, ...FONTS.h3, ...styles.textShadow }}>Details</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: 300,
        marginRight: SIZES.padding,
        marginVertical: SIZES.radius,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.white,
        overflow: 'hidden'
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    textShadow: {
        textShadowColor: COLORS.darkgray,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1
    },
    iconButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginHorizontal: 3
    },
    priceView: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        borderBottomStartRadius: SIZES.radius,
        borderBottomEndRadius: SIZES.radius,
        marginTop: 5
    },
    row: {
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})

export default InvestmentCard;