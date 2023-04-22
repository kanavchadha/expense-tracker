import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryGroup, VictoryBar, VictoryPie } from 'victory-native';
import { FONTS, SIZES, COLORS } from '../constants';
import { Svg } from 'react-native-svg';

const ChartGroup = ({ selectedCategory, setSelectCategoryByName, chartData, colorScales, title, extraText, extraStyles }) => {
  return (
    <View style={styles.chartContainer}>
      {/* <VictoryChart width={extraStyles?.width ? extraStyles.width : SIZES.width / 1.01}>
        <VictoryGroup
          offset={25}
          animate={{
            duration: 2000,
            onLoad: { duration: 10 }
          }}
          events={[{
            childName: "all",
            target: "data",
            eventHandlers: {
              onClick: () => {
                return [
                  {
                    childName: "bar-1",
                    target: "data",
                    mutation: (props) => {
                      console.log(props.index, chartData[props.index]);
                      const categoryName = chartData[props.index] ? chartData[props.index].x : 'All'
                      setSelectCategoryByName(categoryName)
                    }
                  }, {
                    childName: "bar-2",
                    target: "data",
                    mutation: (props) => {
                      const categoryName = chartData[props.index] ? chartData[props.index].x : 'All'
                      setSelectCategoryByName(categoryName)
                    }
                  }
                ];
              }
            }
          }]}
        >
          <VictoryBar
            width={SIZES.width / 1.1}
            name='bar-1'
            colorScale={colorScales}
            data={chartData.data1}
            cornerRadius={2}
            style={{
              data: { stroke: COLORS.gray, strokeWidth: ({ datum }) => datum.x === selectedCategory ? 2 : 0 },
              parent: { ...styles.shadow },
            }}
          />
          <VictoryBar
            name='bar-2'
            colorScale={colorScales}
            cornerRadius={2}
            data={chartData.data2}
            style={{
              data: { stroke: COLORS.gray, strokeWidth: ({ datum }) => datum.x === selectedCategory ? 2 : 0 },
              parent: { ...styles.shadow },
            }}
          />
        </VictoryGroup>
      </VictoryChart> */}
      {chartData && (chartData.data1?.length > 0 || chartData.data2?.length > 0) &&
        <View styles={styles.chartView}>
          <Text style={styles.title} onPress={() => setSelectCategoryByName('All')} numberOfLines={2}>{title}</Text>

          <Svg width={SIZES.width} height={SIZES.width} style={{ zIndex: 3 }}>
            <VictoryPie
              standalone={false}
              radius={({ datum }) => (selectedCategory && selectedCategory == datum.x) ? SIZES.width * 0.45 : SIZES.width * 0.45 - 10}
              innerRadius={100}
              labelRadius={({ innerRadius }) => (SIZES.width * 0.45 + innerRadius) / 2.38}
              data={chartData.data1}
              colorScale={colorScales}
              style={{
                labels: { fill: "white" },
                parent: {
                  ...styles.shadow
                },
              }}
              events={[{
                target: "data",
                eventHandlers: {
                  onPress: () => {
                    return [{
                      target: "data",
                      mutation: (props) => {
                        const categoryName = chartData.data1[props.index].x
                        setSelectCategoryByName(categoryName)
                      }
                    }]
                  }
                }
              }]}
              animate={{
                onLoad: { duration: 10 },
                duration: 2000,
                easing: "circle"
              }}
            />
          </Svg>
          <Svg width={SIZES.width / 1.31} height={SIZES.width / 1.31} style={{ position: 'absolute', left: SIZES.width * 0.004, top: SIZES.width * 0.004, zIndex: 3 }}>
            <VictoryPie
              standalone={false}
              radius={({ datum }) => (selectedCategory && selectedCategory == datum.x) ? (SIZES.width / 1.45) * 0.38 : (SIZES.width / 1.45) * 0.38 - 10}
              innerRadius={45}
              labelRadius={({ innerRadius }) => ((SIZES.width / 1.4) * 0.4 + innerRadius) / 2.8}
              data={chartData.data2}
              colorScale={colorScales}
              style={{
                labels: { fill: "white" },
                parent: {
                  ...styles.shadow
                },
              }}
              events={[{
                target: "data",
                eventHandlers: {
                  onPress: () => {
                    return [{
                      target: "data",
                      mutation: (props) => {
                        const categoryName = chartData.data2[props.index].x
                        setSelectCategoryByName(categoryName)
                      }
                    }]
                  }
                }
              }]}
              animate={{
                onLoad: { duration: 10 },
                duration: 2000,
                easing: "circle"
              }}
            />
          </Svg>
        </View>
      }
      <Text style={styles.extraText}>{extraText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  chartView: {
    position: 'relative',
    width: '100%',
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
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: 'center',
    position: 'absolute',
    top: SIZES.width / 2.18,
    left: SIZES.width / 2.46,
    width: SIZES.width / 5,
    zIndex: 4
  },
  extraText: {
    marginBottom: 5,
    paddingHorizontal: 2,
    ...FONTS.body3,
    color: COLORS.secondary
  }
})

export default ChartGroup;

// Pie Chart grouped
{/* <div>
<svg width={450} height={450} style={{ position: 'absolute', left: '15%', top: '10%' }}>
  <VictoryPie
    standalone={false}
    width={450} height={450}
    innerRadius={120}
    labelRadius={150}
    data={sampleData}
    colorScale='qualitative'
    theme={VictoryTheme.material}
  />
</svg>
<svg width={300} height={300} style={{ position: 'absolute', left: '27.8%', top: '25.5%' }}>
  <VictoryPie
    standalone={false}
    colorScale='qualitative'
    width={300} height={300}
    innerRadius={60}
    labelRadius={75}
    data={sampleData}
    theme={VictoryTheme.material}
  />
</svg>
</div> */}