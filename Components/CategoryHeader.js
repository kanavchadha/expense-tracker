import React from "react";
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, icons } from '../constants';

export default CategoryHeader = ({ viewMode, setViewMode }) => {
    return (
        <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: SIZES.padding, justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View>
                    <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>CATEGORIES</Text>
                    <Text style={{ color: COLORS.darkgray, ...FONTS.body4 }}> 14 Total</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: viewMode == "chart" ? COLORS.secondary : null,
                        height: 50,
                        width: 50,
                        borderRadius: 25
                    }}
                    onPress={() => setViewMode("chart")}
                >
                    <Image
                        source={icons.chart}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: viewMode == "chart" ? COLORS.white : COLORS.darkgray,
                        }}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: viewMode == "list" ? COLORS.secondary : null,
                        height: 50,
                        width: 50,
                        borderRadius: 25,
                        marginLeft: SIZES.base
                    }}
                    onPress={() => setViewMode("list")}
                >
                    <Image
                        source={icons.menu}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: viewMode == "list" ? COLORS.white : COLORS.darkgray,
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}