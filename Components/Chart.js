import { View, Text, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { VictoryPie } from 'victory-native';
import { Svg } from 'react-native-svg';
import { FONTS, SIZES, COLORS } from '../constants';

const Chart = ({ selectedCategory, setSelectCategoryByName, chartData, colorScales, totalCount, title }) => {
    return (
        <>
            {Platform.OS === 'ios' ?
                <VictoryPie
                    data={chartData}
                    labels={(datum) => `${datum.y}`}
                    radius={({ datum }) => (selectedCategory && selectedCategory == datum.name) ? SIZES.width * 0.4 : SIZES.width * 0.4 - 10}
                    innerRadius={70}
                    labelRadius={({ innerRadius }) => (SIZES.width * 0.4 + innerRadius) / 2.5}
                    style={{
                        labels: { fill: "white", ...FONTS.body3 },
                        parent: {
                            ...styles.shadow
                        },
                    }}
                    width={SIZES.width * 0.8}
                    height={SIZES.width * 0.8}
                    colorScale={colorScales}
                    events={[{
                        target: "data",
                        eventHandlers: {
                            onPress: () => {
                                return [{
                                    target: "labels",
                                    mutation: (props) => {
                                        let categoryName = chartData[props.index].name
                                        setSelectCategoryByName(categoryName)
                                    }
                                }]
                            }
                        }
                    }]}
                    animate={{
                        duration: 2000,
                        easing: "circle"
                    }}
                /> :
                <Svg width={SIZES.width} height={SIZES.width} style={{ width: "100%", height: "auto" }}>
                    <VictoryPie
                        standalone={false} // Android workaround
                        data={chartData}
                        labels={(datum) => `${datum.y}`}
                        radius={({ datum }) => (selectedCategory && selectedCategory == datum.name) ? SIZES.width * 0.4 : SIZES.width * 0.4 - 10}
                        innerRadius={70}
                        labelRadius={({ innerRadius }) => (SIZES.width * 0.4 + innerRadius) / 2.5}
                        style={{
                            labels: { fill: "white", ...FONTS.body3 },
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
                                            let categoryName = chartData[props.index].name
                                            setSelectCategoryByName(categoryName)
                                        }
                                    }]
                                }
                            }
                        }]}
                        animate={{
                            duration: 2000,
                            easing: "circle"
                        }}
                    />
                </Svg>
            }
            <View style={{ position: 'absolute', top: '42%', left: "41%" }} onTouchEnd={() => setSelectCategoryByName('All')}>
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