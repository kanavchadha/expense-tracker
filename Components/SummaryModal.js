import React, { useEffect, useState, useRef } from 'react'
import { Text, StyleSheet, View, Dimensions, Modal, ScrollView, Image, Alert, ActivityIndicator } from 'react-native'
import { COLORS, FONTS } from '../constants';
import logo from '../assets/icon.png';
import { showToastMessage, processCategoryDataToDisplay } from '../helpers';
import OptionsBar from './OptionsBar';
import ViewShot from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import Chart from "./Chart";
import SummaryHeader from "./SummaryHeader";
import ExpenseSummary from './ExpenseSummary';

export default OverAllExpenseSummaryModal = ({ modalVisible, setModalVisible }) => {
    const [category, setCategory] = useState('');
    const [chartData, setChartData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const [totalExpenditure, setTotalExpenditure] = useState({});
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [status, setStatus] = useState('all');
    const [loading, setLoading] = useState(false);
    const chartContainer = useRef();

    useEffect(() => {
        setLoading(true);
        processCategoryDataToDisplay(status, null, true).then(res => {
            setChartData(res.finalChartData);
            setColorScales(res.finalChartData.map((item) => item.color));
            setTotalExpenditure({total: res.totalExpense, count: res.expenseCount, details: res.expSumDetail});
            setMonthlyIncome(res.income);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Error occured while reading data. ' + err.message);
        })
    }, [status])

    const downloadSummary = () => {
        showToastMessage('Downloading Started...', 'bottom', 'long');
        chartContainer.current.capture().then(uri => {
            console.log('File has been saved to:', uri);
            shareAsync(uri, { UTI: '.png', mimeType: 'application/png' });
            showToastMessage('Downloading Completed...', 'bottom', 'long');
        }).catch(err => {
            showToastMessage('Download Failed...', 'bottom', 'long');
            Alert.alert('Something went wrong!', err.message);
        })
    }

    return (
        <SummaryModal title={'Overall Summary'} modalVisible={modalVisible} setModalVisible={setModalVisible}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                <Image source={logo} resizeMode='contain' style={{ width: 50, height: 50 }} />
                {!loading && <OptionsBar status={status} setStatus={setStatus} onPressDownload={downloadSummary} />}
            </View>
            <ScrollView>
                <ViewShot ref={chartContainer} options={{ format: "png" }}>
                    <View style={{ flex: 1 }}>
                        {loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                            <>
                                <SummaryHeader monthlyIncome={monthlyIncome} status={status} totalExpenditure={totalExpenditure.total} summaryDetails={totalExpenditure.details} />
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Chart selectedCategory={category} setSelectCategoryByName={setCategory} chartData={chartData} colorScales={colorScales} totalCount={totalExpenditure.count} />
                                </View>
                                <ExpenseSummary data={chartData} selectedCategory={category} setSelectedCategory={setCategory} status={status} totalExpenditure={totalExpenditure.details?.paidExpenseTotal} totalIncome={monthlyIncome?.paidAmount} />
                            </>
                        }
                    </View>
                </ViewShot>
            </ScrollView>
        </SummaryModal>
    )
}

export const SummaryModal = ({ children, modalVisible, setModalVisible, title }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => { setModalVisible(false) }}
        >
            <View style={styles.centeredView}>
                <View style={styles.backdrop} onTouchEnd={() => { setModalVisible(false) }} />
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.form}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        height: Dimensions.get('screen').height,
        justifyContent: "center",
        alignItems: 'center'
    },
    backdrop: {
        position: 'absolute',
        flex: 1,
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    title: {
        fontSize: FONTS.h1.fontSize,
        fontFamily: FONTS.h1.fontFamily,
        color: COLORS.lightGray,
        textAlign: 'center',
        position: 'relative',
        top: 5,
        letterSpacing: 2,
        textShadowOffset: { width: 2, height: 2 },
        textShadowColor: COLORS.peach,
        textShadowRadius: 3,
        zIndex: 5
    },
    form: {
        width: '95%',
        minheight: 200,
        maxHeight: 536,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: COLORS.secondary,
        borderRadius: 15,
        zIndex: 5,
        shadow: {
            shadowColor: "#000",
            shadowOffset: {
                width: 2,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 3
        },
        justifyContent: 'space-between'
    }
})