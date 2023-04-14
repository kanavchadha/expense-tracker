import { useState } from "react";
import { View, Text, FlatList, Alert, ActivityIndicator } from 'react-native'
import { COLORS, FONTS, SIZES } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { getInvestmentsByCategory } from "../../DB";
import InvestmentCard from "./InvestmentCard";

const InvestmentList = ({ investments, title, investmentCount, totalInvested, totalReturns, status, fromDate, toDate, order, updateInvestmentList, deleteInvestment, showInvestmentDetails }) => {
    const { navigate } = useNavigation();
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(10);

    const fetchMoreInvestments = async () => {
        if (loading || investments.length < 10) return;
        try {
            console.log('fetching....');
            setLoading(true)
            const res = await getInvestmentsByCategory(title, fromDate.toISOString(), toDate.toISOString(), status, 10, offset, order);
            updateInvestmentList(title, res.rows._array);
            if (res.rows._array.length > 0) setOffset(prevState => prevState + 10);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Error occured while reading data. ' + err.message);
        }
    }

    const editInvestment = async (id) => {
        navigate('InvestmentForm', { isEditMode: true, id: id });
    }

    const copyInvestment = async (id) => {
        navigate('InvestmentForm', { isEditMode: true, id: id, copy: true });
    }

    const onDeleteInvestment = async (id) => {
        setLoading(true);
        await deleteInvestment(id);
        setLoading(false);
    }

    return (
        <View>
            <View style={{ padding: SIZES.padding }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ ...FONTS.h3, color: COLORS.primary }}>{title}</Text>
                    {loading ? <ActivityIndicator size='small' color={COLORS.secondary} /> :
                        <Text style={{ ...FONTS.body4, color: COLORS.blue }}>{investmentCount} Total</Text>
                    }
                </View>
                {loading ? <ActivityIndicator size='small' color={COLORS.secondary} style={{ alignSelf: 'flex-start' }} /> :
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ ...FONTS.body4, color: COLORS.danger, marginRight: 5 }} numberOfLines={1}>{totalInvested}Rs TotalInvested</Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.darkgreen }} numberOfLines={1}>{totalReturns}Rs TotalReturned</Text>
                    </View>
                }
            </View>
            {
                investments && investments.length > 0 ?
                    <FlatList
                        onEndReached={fetchMoreInvestments}
                        data={investments}
                        renderItem={({ item, index }) =>
                            <InvestmentCard
                                id={item.id}
                                title={item.title}
                                category={item.category}
                                reference={item.reference}
                                timePeriod={item.timePeriod}
                                startDate={item.startDate}
                                status={item.isActive}
                                totalInvested={item.totalInvAmount}
                                totalReturns={item.totalRetAmount}
                                editInvestment={editInvestment}
                                deleteInvestment={onDeleteInvestment}
                                copyInvestment={copyInvestment}
                                showDetails={showInvestmentDetails}
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


export default InvestmentList;