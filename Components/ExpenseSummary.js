import React from "react";
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants';

export default ExpenseSummary = ({ data, selectedCategory, setSelectedCategory, status, totalIncome, totalExpenditure }) => {
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

            {/* Expenses */}
            <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.primary, ...FONTS.h3 }}>{item.y} Rs - {item.label} ({item.expenseCount})</Text>
                {status === 'all' && <Text numberOfLines={1} style={{ color: (selectedCategory === item.name) ? COLORS.white : COLORS.darkgray, ...FONTS.body4 }}>{item.paidAmount ? `${item.paidAmount}Rs -${(item.paidAmount / item.y * 100).toFixed(0)}% (${item.paidCount}) P` : ''} {item.unpaidAmount ? ` ${item.unpaidAmount}Rs -${(item.unpaidAmount / item.y * 100).toFixed(0)}% (${item.unpaidCount}) U` : ''} </Text>}
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