import { View, Text, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { VictoryPie } from 'victory-native';
import { Svg } from 'react-native-svg';
import { FONTS, SIZES, COLORS } from '../constants';

const Chart = ({ selectedCategory, setSelectCategoryByName, chartData, colorScales, totalCount, title, extraTitleStyles }) => {
    return (
        <>
            <VictoryPie
                // standalone={false} // Android workaround
                data={chartData}
                labels={(datum) => `${datum.y}`}
                radius={({ datum }) => (selectedCategory && selectedCategory == datum.name) ? SIZES.width * 0.4 : SIZES.width * 0.4 - 10}
                innerRadius={70}
                labelRadius={({ innerRadius }) => (SIZES.width * 0.4 + innerRadius) / 2.5}
                style={{
                    labels: { fill: "white" },
                    parent: {
                        ...styles.shadow
                    },
                }}
                width={SIZES.width}
                height={SIZES.width}
                colorScale={colorScales}
                events={[{
                    target: "data",
                    eventHandlers: {
                        onPress: () => {
                            return [{
                                target: "labels",
                                mutation: (props) => {
                                    const categoryName = chartData[props.index].name
                                    setSelectCategoryByName(categoryName)
                                }
                            }]
                        }
                    }
                }]}
                animate={{
                    onLoad: { duration: 2000 },
                    duration: 2000,
                    easing: "circle"
                }}
            />
            <View style={{ position: 'absolute', top: SIZES.width / 2.38, left: SIZES.width / 2.42, ...extraTitleStyles }} onTouchEnd={() => setSelectCategoryByName('All')}>
                <Text numberOfLines={1} style={{ ...FONTS.h1, textAlign: 'center', color: COLORS.primary }}>{totalCount}</Text>
                <Text numberOfLines={1} style={{ ...FONTS.body3, textAlign: 'center', color: COLORS.primary }}>{title}</Text>
            </View>
        </>
    )
}

export default Chart;

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