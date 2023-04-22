import React, { useState, useLayoutEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import DateRange from '../Components/DateRange';
import Investments from '../Components/Investment/Investments';
import InvestmentCharts from '../Components/Investment/InvestmentCharts';
import CategoryHeader from '../Components/CategoryHeader';
import CategoryList from '../Components/CategoryList';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import InvestmentOverallSummaryModal from "../Components/Investment/InvestmentOverallSummary";
import { COLORS, FONTS, investmentCategoryOptions } from "../constants";

const CURR_DATE = new Date();
const CURR_END_DATE = new Date();
CURR_DATE.setDate(2);
CURR_DATE.setUTCHours(0, 0, 0);
CURR_END_DATE.setMonth(CURR_END_DATE.getMonth() + 1);
CURR_END_DATE.setDate(1);
CURR_END_DATE.setUTCHours(23, 59, 59);

const Investment = ({ navigation }) => {
    const [viewMode, setViewMode] = useState("list");
    const [fromDate, setFromDate] = useState(CURR_DATE);
    const [toDate, setToDate] = useState(CURR_END_DATE);
    const [status, setStatus] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [modalVisible, setModalVisible] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () =>
                <TouchableOpacity activeOpacity={0.5} onPress={()=>setModalVisible(true)}>
                    <Text style={{ ...FONTS.h2, color: COLORS.white }}> My Investments <MaterialCommunityIcons name="chart-line-variant" size={25} color={COLORS.white} /></Text>
                </TouchableOpacity>,
            headerShown: true,
            headerStyle: {
                backgroundColor: COLORS.blue,
            },
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerRight: () => (
                <Ionicons name='add-circle-outline' size={30} color='#fff' onPress={() => navigation.navigate('InvestmentForm', {})} />
            ),
        });
    }, [navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGray2 }}>
            <DateRange fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} />
            <CategoryHeader viewMode={viewMode} setViewMode={setViewMode} numOfCategories={investmentCategoryOptions.length - 1} />
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                {
                    viewMode == "list" &&
                    <View>
                        <CategoryList selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={investmentCategoryOptions} height={335} />
                        <Investments selectedCategory={selectedCategory} fromDate={fromDate} toDate={toDate} status={status} setStatus={setStatus} />
                    </View>
                }
                {
                    viewMode == "chart" &&
                    <InvestmentCharts selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} fromDate={fromDate} toDate={toDate} status={status} setStatus={setStatus} />
                }
            </ScrollView>
            {modalVisible && <InvestmentOverallSummaryModal filter={status} setFilter={setStatus} modalVisible={modalVisible} setModalVisible={setModalVisible} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}  />}
        </View>
    )
}

export default Investment;