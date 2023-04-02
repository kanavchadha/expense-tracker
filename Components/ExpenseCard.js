import { StyleSheet, Text, View, Image, TouchableOpacity, } from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, categoryOptions } from '../constants';

const getCategoryData = (category) => {
    return categoryOptions.find(cat => cat.value === category);
}

const ExpenseCard = ({ id, title, category, date, description, amount, status, index, invId, editExpense, deleteExpense, copyExpense, setExpensePaid, showInvestmentDetails, extraCardStyles }) => {
    // console.log(title, ': ', new Date(date.split(' ').join('T')));
    return (
        <View style={{
            width: 300,
            marginRight: SIZES.padding,
            marginLeft: index == 0 ? SIZES.padding : 0,
            marginVertical: SIZES.radius,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.white,
            ...styles.shadow,
            ...extraCardStyles
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
                            // tintColor: getCategoryData(category).color
                        }}
                    />
                </View>
                <View style={{ alignSelf: 'flex-end' }}>
                    <Text style={{ ...FONTS.h3, color: getCategoryData(category).color }}>{category}</Text>
                    <Text style={{ ...FONTS.body4, color: COLORS.lightBlue }}> {new Date(date.split(' ')[0]).toDateString()} </Text>
                </View>
                {/* Actions */}
                <View style={{ position: 'absolute', right: 10, top: 5 }}>
                    {
                        category === 'Investment' && invId?.toString() &&
                        <TouchableOpacity onPress={() => showInvestmentDetails(invId)} style={styles.iconButton}>
                            <FontAwesome name='ellipsis-h' size={16} color={COLORS.blue} />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={() => copyExpense(id)} style={styles.iconButton}>
                        <FontAwesome name='copy' size={16} color={COLORS.darkYellow} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editExpense(id)} style={styles.iconButton}>
                        <FontAwesome name='pencil' size={16} color={COLORS.peach} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteExpense(id)} style={styles.iconButton}>
                        <FontAwesome name='trash' size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: SIZES.padding }}>
                {/* Title */}
                <Text style={{ ...FONTS.h2, color: COLORS.primary, marginBottom: 3, marginTop: -10 }} numberOfLines={1}>{title}</Text>
                {/* description */}
                <Text style={{ ...FONTS.body3, color: COLORS.darkgray }} numberOfLines={3}>
                    {description}
                </Text>
            </View>
            {/* Price */}
            {status === 'true' ?
                <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end' }} disabled={true}>
                    <View style={{ ...styles.priceView, backgroundColor: getCategoryData(category).color }}>
                        <Text style={{ color: COLORS.white, ...FONTS.h3, ...styles.textShadow }}>Amount {amount.toFixed(2)} Rs</Text>
                    </View>
                </TouchableOpacity>
                :
                <TouchableOpacity onPress={() => setExpensePaid({ id, title, category, date, description, amount })} style={{ flex: 1, justifyContent: 'flex-end' }} activeOpacity={0.5}>
                    <View style={{ ...styles.priceView, backgroundColor: COLORS.red }}>
                        <Text style={{ color: COLORS.white, ...FONTS.h3, ...styles.textShadow }}>Amount {amount.toFixed(2)} Rs </Text>
                        <Text style={{ color: COLORS.lightGray, ...FONTS.body4 }}> (not paid yet, click to set paid) </Text>
                    </View>
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
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
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomStartRadius: SIZES.radius,
        borderBottomEndRadius: SIZES.radius,
        marginTop: 8
    }
})

export default ExpenseCard;