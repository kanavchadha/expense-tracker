import React, { useState } from "react";
import { ScrollView, View } from 'react-native';
import { COLORS, categoryOptions } from '../constants';
import NavBar from '../Components/Navbar';
import Header from '../Components/Header';
import CategoryList from '../Components/CategoryList';
import CategoryHeader from '../Components/CategoryHeader';
import Expenses from '../Components/Expenses';
import ExpenseCharts from '../Components/ExpenseCharts';
import OverAllExpenseSummaryModal from "../Components/SummaryModal";
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {

    const [viewMode, setViewMode] = useState("list");
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [month, setMonth] = useState(new Date().getMonth());
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View style={{ flex: 1, backgroundColor: COLORS.lightGray2 }}>
                {/* Nav bar section */}
                <NavBar />
                {/* Header section */}
                <Header month={month} setModalVisible={setModalVisible} />
                {/* Category Header Section */}
                <CategoryHeader viewMode={viewMode} setViewMode={setViewMode} numOfCategories={categoryOptions.length - 1} />

                <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                    {
                        viewMode == "list" &&
                        <View>
                            <CategoryList selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categoryOptions} />
                            <Expenses selectedCategory={selectedCategory} month={month} setMonth={setMonth} />
                        </View>
                    }
                    {
                        viewMode == "chart" &&
                        <ExpenseCharts selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} month={month} setMonth={setMonth} />
                    }
                </ScrollView>
                {modalVisible && <OverAllExpenseSummaryModal modalVisible={modalVisible} setModalVisible={setModalVisible} />}
            </View>
        </SafeAreaView>
    )
}

export default Home;