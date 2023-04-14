import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { COLORS, FONTS, SEARCH_SORT_OPTIONS } from '../constants'
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { getExpenseByTitleOrDescription, getExpensesByDate, updateExpense, removeExpense } from '../DB';
import { generateHtmlForExpenseSearchRes, showToastMessage, processSearchResToDisplay } from '../helpers';
import ExpenseCard from "../Components/ExpenseCard";
import OptionsBar from '../Components/OptionsBar';
import SummaryHeader from '../Components/SummaryHeader';
import { SummaryModal } from '../Components/SummaryModal';
import Chart from "../Components/Chart";
import ExpenseSummary from '../Components/ExpenseSummary';
import ViewShot from 'react-native-view-shot';
import DateRange from '../Components/DateRange';

const LIMIT = 20;
const CURR_DATE = new Date();
const CURR_END_DATE = new Date();
CURR_DATE.setUTCHours(0, 0, 0);
CURR_END_DATE.setUTCHours(23, 59, 59);

const Search = () => {
    const { goBack, navigate } = useNavigation();

    const [search, setSearch] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [expensesSummary, setExpensesSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('all');
    const [fromDate, setFromDate] = useState(CURR_DATE);
    const [toDate, setToDate] = useState(CURR_END_DATE);
    const [order, setOrder] = useState('id DESC');
    const [offset, setOffset] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (search) {
                searchExpense()
            } else {
                searchExpenseByDate();
            }
            processSearchResToDisplay(status, fromDate.toISOString(), toDate.toISOString(), search).then(res => {
                setExpensesSummary(res);
            }).catch(err => {
                Alert.alert('Something went wrong!', 'Unable to generate Expenses Summary! ' + err.message);
            })
        }, [status, fromDate.toISOString(), toDate.toISOString()])
    );

    useEffect(() => {
        const sortedExpenses = [...expenses];
        sortedExpenses.sort((a, b) => {
            if (order === 'date ASC') {
                return new Date(a.date.split(' ').join('T')).getTime() - new Date(b.date.split(' ').join('T')).getTime();
            } else if (order === 'date DESC') {
                return new Date(b.date.split(' ').join('T')).getTime() - new Date(a.date.split(' ').join('T')).getTime();
            } else if (order === 'id ASC') {
                return Number(a.id) - Number(b.id);
            } else if (order === 'amount ASC') {
                return Number(a.amount) - Number(b.amount);
            } else if (order === 'amount DESC') {
                return Number(b.amount) - Number(a.amount);
            } else {
                return Number(b.id) - Number(a.id);
            }
        })
        setExpenses(sortedExpenses);
    }, [order]);

    const searchExpenseByDate = async () => {
        setOffset(0);
        try {
            setLoading(true);
            const res = await getExpensesByDate(fromDate.toISOString(), toDate.toISOString(), status, LIMIT, 0, order);
            setExpenses(res.expenses);
            if (res.expenses.length > 0) setOffset(prevState => prevState + LIMIT);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Unable to search expense! ' + err.message);
        }
    }

    const searchExpense = async () => {
        setOffset(0);
        try {
            setLoading(true);
            if (!search) {
                searchExpenseByDate();
                return;
            }
            const res = await getExpenseByTitleOrDescription(search, fromDate.toISOString(), toDate.toISOString(), status, LIMIT, 0, order);
            setExpenses(res.expenses);
            if (res.expenses.length > 0) setOffset(prevState => prevState + LIMIT);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Unable to search expense! ' + err.message);
        }
    }

    const fetchMoreExpense = async () => {
        try {
            if (loading || expenses.length < 20) return;
            setLoading(true);
            let moreExpenses = [];
            if (search) {
                const res = await getExpenseByTitleOrDescription(search, fromDate.toISOString(), toDate.toISOString(), status, LIMIT, offset, order);
                moreExpenses = res.expenses;
            } else {
                const res = await getExpensesByDate(fromDate.toISOString(), toDate.toISOString(), status, LIMIT, offset, order);
                moreExpenses = res.expenses;
            }
            setExpenses(prevState => prevState.concat(moreExpenses));
            if (moreExpenses.length > 0) setOffset(prevState => prevState + LIMIT);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Unable to search expense! ' + err.message);
        }
    }

    const editExpense = async (id) => {
        navigate('ExpenseForm', { isEditMode: true, id: id });
    }

    const copyExpense = async (id) => {
        navigate('ExpenseForm', { isEditMode: true, id: id, copy: true });
    }

    const deleteExpense = async (id) => {
        try {
            // setLoading(true);
            const res = await removeExpense(id);
            if (res.rowsAffected !== 1) throw new Error('Error in Deleting Data');
            showToastMessage('Expense deleted successfully', 'bottom', 'long');
            // setExpenses(prevState => prevState.filter(exp => exp.id !== id));
            // setLoading(false);
            if (search) {
                searchExpense()
            } else {
                searchExpenseByDate();
            }
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Unable to delete expense. ' + err.message);
            return false;
        }
    }

    const setExpensePaid = async (item) => {
        try {
            // setLoading(true);
            const res = await updateExpense(item.title, item.category, item.amount, item.date, item.description, 'true', item.id);
            if (res.rowsAffected !== 1) throw new Error('Error in updating Data!');
            showToastMessage('Expense Set to Paid', 'bottom', 'long');
            // const { id } = item;
            // setExpenses(prevState => {
            //     const expInd = prevState.findIndex(exp => exp.id === id);
            //     if (expInd < 0) return prevState;
            //     const newExpenseList = [...prevState];
            //     newExpenseList[expInd] = { ...newExpenseList[expInd], status: 'true' }
            //     return newExpenseList;
            // });
            // setLoading(false);
            if (search) {
                searchExpense()
            } else {
                searchExpenseByDate();
            }
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Unable to update expense. ' + err.message);
        }
    }

    const downloadExpenses = async () => {
        try {
            showToastMessage('Downloading Started...', 'bottom', 'long');
            const html = generateHtmlForExpenseSearchRes(expenses, expensesSummary, { from: fromDate, to: toDate }, search, status, order);
            const { uri } = await Print.printToFileAsync({ html });
            console.log('File has been saved to:', uri);
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            showToastMessage('Downloading Completed...', 'bottom', 'long');
        } catch (err) {
            showToastMessage('Download Failed...', 'bottom', 'long');
            Alert.alert('Something went wrong!', err.message);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightGray }}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <TouchableOpacity onPress={goBack} activeOpacity={0.6}>
                        <Ionicons name='arrow-back-outline' size={40} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <TextInput value={search} onChangeText={(value) => setSearch(value)} style={styles.input} placeholder='Search By Title, Description' placeholderTextColor={COLORS.lightBlue} />
                    <TouchableOpacity onPress={searchExpense} activeOpacity={0.6} disabled={loading}>
                        {loading ?
                            <ActivityIndicator size='large' color={COLORS.secondary} /> :
                            <Ionicons name='search-circle' size={48} color={COLORS.secondary} />
                        }
                    </TouchableOpacity>
                </View>
                <DateRange fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} />
                {!loading &&
                    <View style={styles.searchBar}>
                        <OptionsBar
                            status={status}
                            setStatus={setStatus}
                            onPressDownload={downloadExpenses}
                            filter={order}
                            setFilter={setOrder}
                            filters={SEARCH_SORT_OPTIONS}
                            iconBtn={true}
                            summaryIcon='stats-chart-outline'
                            onPressSummary={() => setModalVisible(true)}
                        />
                    </View>
                }
            </View>
            {
                expenses && expenses.length > 0 ?
                    <FlatList
                        onEndReached={fetchMoreExpense}
                        data={expenses}
                        renderItem={({ item, i }) =>
                            <ExpenseCard
                                index={i}
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                category={item.category}
                                date={item.date}
                                amount={item.amount}
                                description={item.description}
                                status={item.status}
                                editExpense={editExpense}
                                copyExpense={copyExpense}
                                deleteExpense={deleteExpense}
                                setExpensePaid={setExpensePaid}
                                extraCardStyles={{ marginLeft: 10, marginRight: 10, width: 320 }}
                            />
                        }
                        keyExtractor={item => `${item.id}`}
                        contentContainerStyle={{ alignItems: 'center' }}
                        style={{ width: '100%' }}
                    /> :
                    <View style={{ alignItems: 'center', justifyContent: 'center', height: 80 }}>
                        <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>No Record</Text>
                    </View>
            }
            <SearchResSummary modalVisible={modalVisible} setModalVisible={setModalVisible} search={search} expensesSummary={expensesSummary} status={status} fromDate={fromDate} toDate={toDate} />
        </SafeAreaView>
    )
}

const SearchResSummary = ({ modalVisible, setModalVisible, expensesSummary, status, search, fromDate, toDate }) => {
    const [category, setCategory] = useState('');
    const [chartData, setChartData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const chartContainer = useRef();

    useEffect(() => {
        if (!expensesSummary || !expensesSummary.finalChartData) return;
        setChartData(expensesSummary.finalChartData);
        setColorScales(expensesSummary.finalChartData.map((item) => item.color));
    }, [expensesSummary]);

    const downloadSummary = () => {
        showToastMessage('Downloading Started...', 'bottom', 'long');
        chartContainer.current.capture().then(uri => {
            console.log('File has been saved to:', uri);
            return shareAsync(uri, { UTI: '.png', mimeType: 'application/png' });
        }).then((res)=>{
            showToastMessage('Downloading Completed...', 'bottom', 'long');
        }).catch(err => {
            showToastMessage('Download Failed...', 'bottom', 'long');
            Alert.alert('Something went wrong!', err.message);
        })
    }

    return (
        <SummaryModal title={'Search Summary'} modalVisible={modalVisible} setModalVisible={setModalVisible}>
            <ScrollView>
                <ViewShot ref={chartContainer} options={{ format: "png" }}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.searchBar}>
                            <Text style={styles.summaryText}> {fromDate.toDateString()} - {toDate.toDateString()} </Text>
                            <Text style={styles.summaryText}>{search}</Text>
                            <Text style={styles.summaryText}>{status === 'true' ? 'PAID' : status === 'false' ? 'UNPAID' : 'All'}</Text>
                        </View>
                        <SummaryHeader status={status}
                            monthlyIncome={expensesSummary.income}
                            expenseCount={expensesSummary.expenseCount}
                            totalExpenditure={expensesSummary.totalExpense}
                            summaryDetails={expensesSummary.expSumDetail}
                        />
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Chart title='Expenses' selectedCategory={category} setSelectCategoryByName={setCategory} chartData={chartData} colorScales={colorScales} totalCount={expensesSummary.expenseCount} />
                        </View>
                        <ExpenseSummary data={chartData} selectedCategory={category} setSelectedCategory={setCategory} status={status} totalExpenditure={expensesSummary?.expSumDetail?.paidExpenseTotal} totalIncome={expensesSummary?.income?.paidAmount} />
                    </View>
                </ViewShot>
            </ScrollView>
            <TouchableOpacity activeOpacity={0.5} onPress={downloadSummary} style={styles.downloadIconBtn}>
                <Ionicons name='arrow-down-circle' size={45} color={COLORS.secondary} />
            </TouchableOpacity>
        </SummaryModal>
    )
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: COLORS.primary,
        fontSize: FONTS.body2.fontSize,
        fontFamily: FONTS.body2.fontFamily,
        marginHorizontal: 5,
        marginLeft: 15
    },
    header: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        height: 195
    },
    summaryText: {
        fontSize: FONTS.h3.fontSize,
        fontFamily: FONTS.h3.fontFamily,
        color: COLORS.primary,
        paddingHorizontal: 3
    },
    downloadIconBtn: {
        position: 'absolute',
        bottom: 5,
        left: 5
    }
})

export default Search;