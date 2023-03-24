import React, { useRef } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Animated } from 'react-native';
import { COLORS, FONTS, SIZES, icons } from '../constants';

export default CategoryList = ({ setSelectedCategory, selectedCategory, categories, height }) => {
    const fullHeight = height || 448;
    const [showMoreToggle, setShowMoreToggle] = React.useState(false)
    const categoryListHeightAnimationValue = useRef(new Animated.Value(115)).current;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => setSelectedCategory(item.value === 'Category' ? 'All' : item.value)}
            style={{
                flex: 1,
                flexDirection: 'row',
                margin: 5,
                paddingVertical: SIZES.radius,
                paddingHorizontal: SIZES.padding,
                borderRadius: 5,
                backgroundColor: selectedCategory === item.value ? item.color : COLORS.white,
                ...styles.shadow
            }}
        >
            <Image
                source={item.icon}
                resizeMode="contain"
                style={{
                    width: 22,
                    height: 22,
                    // tintColor:  selectedCategory !== item.value ? item.color : COLORS.white
                }}
            />
            <Text numberOfLines={1} style={{
                ...FONTS.h4,
                marginLeft: SIZES.base,
                color: selectedCategory === item.value ? COLORS.white : item.color,
            }}>
                {item.value === 'Category' ? 'All' : item.value}
            </Text>
        </TouchableOpacity>
    )

    return (
        <View style={{ paddingHorizontal: SIZES.padding - 5 }}>
            <Animated.View style={{ height: categoryListHeightAnimationValue }}>
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={item => `${item.id}`}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                />
            </Animated.View>

            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    marginVertical: SIZES.base,
                    justifyContent: 'center'
                }}
                onPress={() => {
                    if (showMoreToggle) {
                        Animated.timing(categoryListHeightAnimationValue, {
                            toValue: 115,
                            duration: 680,
                            useNativeDriver: false
                        }).start()
                    } else {
                        Animated.timing(categoryListHeightAnimationValue, {
                            toValue: fullHeight,
                            duration: 680,
                            useNativeDriver: false
                        }).start()
                    }

                    setShowMoreToggle(!showMoreToggle)
                }}
            >
                <Text style={{ ...FONTS.body4 }}>{showMoreToggle ? "LESS" : "MORE"}</Text>
                <Image
                    source={showMoreToggle ? icons.up_arrow : icons.down_arrow}
                    style={{ marginLeft: 5, width: 15, height: 15, alignSelf: 'center' }}
                />
            </TouchableOpacity>
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
    }
})