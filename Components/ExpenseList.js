import { useState } from "react";
import { View, Text, FlatList, Alert, ActivityIndicator } from 'react-native'
import { COLORS, FONTS, SIZES } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { getExpensesByCategory } from "../DB";
import ExpenseCard from "./ExpenseCard";

const ExpenseList = ({ expenses, title, expenseCount, expenseTotal, status, month, updateExpenseList, deleteExpense, setExpensePaid }) => {
    const { navigate } = useNavigation();
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(10);

    const fetchMoreExpense = async () => {
        if (loading || expenses.length<10) return;
        try {
            console.log('fetching....');
            setLoading(true)
            const res = await getExpensesByCategory(title, 10, offset, status, month);
            updateExpenseList(title, res.rows._array);
            if(res.rows._array.length>0) setOffset(prevState => prevState + 10);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Error occured while reading data. ' + err.message);
        }
    }


    const editExpense = async (id) => {
        navigate('ExpenseForm', { isEditMode: true, id: id });
    }

    const copyExpense = async (id) => {
        navigate('ExpenseForm', { isEditMode: true, id: id, copy: true });
    }

    const onDeleteExpense = async (id, category) => {
        setLoading(true);
        await deleteExpense(id, category);
        setLoading(false);
    }

    const onExpensePaid = async (item) => {
        setLoading(true);
        await setExpensePaid(item);
        setLoading(false);
    }

    return (
        <View>
            <View style={{ padding: SIZES.padding }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ ...FONTS.h3, color: COLORS.primary }}>{title}</Text>
                    {loading ? <ActivityIndicator size='small' color={COLORS.secondary} /> :
                        <Text style={{ ...FONTS.body3, color: COLORS.darkgreen }}>{expenseTotal}</Text>
                    }
                </View>
                {loading ? <ActivityIndicator size='small' color={COLORS.secondary} style={{alignSelf: 'flex-start'}} /> :
                    <Text style={{ ...FONTS.body4, color: COLORS.darkgray }}>{expenseCount} Total</Text>
                }
            </View>
            {
                expenses && expenses.length > 0 ?
                    <FlatList
                        onEndReached={fetchMoreExpense}
                        data={expenses}
                        renderItem={({ item, index }) =>
                            <ExpenseCard
                                id={item.id}
                                title={item.title}
                                category={item.category}
                                date={item.date}
                                amount={item.amount}
                                description={item.description}
                                status={item.status}
                                editExpense={editExpense}
                                deleteExpense={onDeleteExpense}
                                copyExpense={copyExpense}
                                setExpensePaid={onExpensePaid}
                                index={index}
                            />
                        }
                        keyExtractor={item => `${item.id}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    /> :
                    <View style={{ alignItems: 'center', justifyContent: 'center', height: 60 }}>
                        <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>No Record</Text>
                    </View>
            }
        </View>
    )
}


export default ExpenseList;