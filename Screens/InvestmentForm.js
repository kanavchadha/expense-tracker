import { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View, Text, Switch, ActivityIndicator } from 'react-native';
import FormModal from '../Components/FormModal';
import { COLORS, FONTS, investmentCategoryOptions } from '../constants';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getInvestmentById, insertExpense, insertInvestment, updateInvestment } from '../DB';
import { getUniqueId, showToastMessage } from '../helpers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const InvestmentForm = () => {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [investments, setInvestments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const { goBack, } = useNavigation();
  const { params } = useRoute();
  const { isEditMode, id, copy } = params;

  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    getInvestmentById(id).then(res => {
      const investment = res.rows?._array[0];
      if (!investment) throw new Error('Data not found!');
      setCategory(investment.category);
      setTitle(investment.title);
      setReference(investment.reference);
      setTimePeriod(investment.timePeriod.toString());
      setInvestments(
        JSON.parse(investment.investments).map(inv => ({
          id: inv.id,
          date: new Date(inv.date),
          amount: inv.amount.toString(),
          interest: inv.interest.toString()
        }))
      );
      if (!copy)
        setReturns(
          JSON.parse(investment.returns).map(ret => ({
            id: ret.id,
            date: new Date(ret.date),
            amount: ret.amount.toString()
          }))
        );
      if (!copy) setIsActive(investment.isActive === 'true' ? true : false);
      else setIsActive(true);
      setLoading(false);
    }).catch(err => {
      showToastMessage('Failed to edit this Investment!');
      console.log(err.message);
      setLoading(false);
    })
  }, []);

  const openDatePicker = (id, field, date) => {
    DateTimePickerAndroid.open({
      value: date ? date : new Date(),
      is24Hour: true,
      onChange: (event, value) => {
        if (field === 'investments')
          investmentsChangeHandler(id, 'date', value);
        else if (field === 'returns')
          returnsChangeHandler(id, 'date', value);
      }
    });
  }

  const updateInvestments = (id, field, value) => {
    setInvestments(prevInvestments => {
      if (id && (!field && !value)) {
        if (prevInvestments.length <= 1) return prevInvestments;
        return prevInvestments.filter(inv => inv.id !== id);
      }
      const updatedInvestments = [...prevInvestments];
      const invInd = prevInvestments.findIndex(inv => inv.id === id);
      if (invInd < 0) {
        showToastMessage('Unable to update investments data!');
        return prevInvestments;
      }
      updatedInvestments[invInd] = { ...updatedInvestments[invInd], [field]: value };
      return updatedInvestments;
    })
  }

  const updateReturns = (id, field, value) => {
    setReturns(prevReturns => {
      if (id && (!field && !value)) {
        if (prevReturns.length <= 1) return prevReturns;
        return prevReturns.filter(ret => ret.id !== id);
      }
      const updatedReturns = [...prevReturns];
      const retInd = prevReturns.findIndex(ret => ret.id === id);
      if (retInd < 0) {
        showToastMessage('Unable to update investments data!');
        return prevReturns;
      }
      updatedReturns[retInd] = { ...updatedReturns[retInd], [field]: value };
      return updatedReturns;
    })
  }

  const referenceChangeHandler = (value) => {
    if (value.length > 120) return;
    setReference(value);
  }
  const titleChangeHandler = (value) => {
    if (value.length > 40) return;
    setTitle(value);
  }
  const categoryChangeHandler = (itemValue) => {
    setCategory(itemValue);
  }
  const investmentsChangeHandler = (id, field, value) => {
    if (!id) {
      setInvestments(prevInvestments => prevInvestments.concat({ id: getUniqueId(8), date: new Date(), amount: '', interest: '' }));
      return;
    }
    updateInvestments(id, field, value);
  }
  const returnsChangeHandler = (id, field, value) => {
    if (!id) {
      setReturns(prevReturns => prevReturns.concat({ id: getUniqueId(8), date: new Date(), amount: '' }));
      return;
    }
    updateReturns(id, field, value);
  }

  const submit = async () => {
    if (!title || !category || category === 'Category' || investments?.length <= 0 || !timePeriod) {
      showToastMessage('Please Fill all the Fields Correctly!', 'top');
      if(investments.length === 0) showToastMessage('Please add atleast 1 investment!', 'top');
      throw new Error('Please Fill all the Fields');
    }
    if (isEditMode && !copy) {
      const res = await updateInvestment(title, category, reference, timePeriod, investments, returns, isActive, id);
      if (res.investment.rowsAffected !== 1 || res.expense.rowsAffected !== 1) throw new Error('Error in Updating Data');
      goBack();
      return;
    }
    const res = await insertInvestment(title, category, reference, timePeriod, investments, returns, isActive);
    if(!res) throw new Error('Something went wrong!');
    res.expense = await insertExpense(title, 'Investment', investments.reduce((val, inv) => (val + (Math.round(Number(inv.amount) * 100) / 100)), 0), investments[0].date.toISOString(), reference, 'true', res.investment?.insertId);
    if (res.investment.rowsAffected !== 1 || res.expense.rowsAffected !== 1) throw new Error('Error in Saving Data');
    goBack();
  }

  return (
    <FormModal title={!isEditMode || copy ? 'Add Investment' : 'Update Investment'} submit={submit} successMsg={`Investment ${isEditMode && !copy ? 'Updated' : 'Added'} Successfully.`} showErrAlert>
      {
        loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
          <>
            <Text style={styles.inputLable}>Choose a Category : </Text>
            <View style={{ ...styles.input, marginBottom: 0 }}>
              <Picker
                selectedValue={category}
                mode='dropdown'
                style={{ color: COLORS.primary, marginVertical: -10 }}
                onValueChange={categoryChangeHandler}>
                {
                  investmentCategoryOptions.map(item => <Picker.Item key={item.id} label={item.value.toUpperCase()} value={item.value} />)
                }
              </Picker>
            </View>
            <Text style={styles.inputLable}>Title ({title.length}/40): </Text>
            <TextInput value={title} keyboardType='default' placeholder='Title' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={titleChangeHandler} />
            <Text style={styles.inputLable}> Reference (optional) ({reference.length}/120): </Text>
            <TextInput value={reference} keyboardType='default' placeholder='Little Reference' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={referenceChangeHandler} multiline numberOfLines={3} />
            <Text style={styles.inputLable}> Overall Time Period (in years): </Text>
            <TextInput value={timePeriod} keyboardType='number-pad' placeholder='Time Period' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setTimePeriod(value)} />

            <View style={styles.inputsGroup}>
              <Text style={styles.inputLable}> All Investments: </Text>
              {investments?.map(inv =>
                <View style={styles.inputsRow} key={inv.id}>
                  <TouchableOpacity onPress={() => openDatePicker(inv.id, 'investments', inv.date)} activeOpacity={1} style={{ marginTop: 5 }}>
                    <View style={styles.input}>
                      <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary, }}>
                        {inv.date.toDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TextInput value={inv.amount} keyboardType='number-pad' placeholder='Amount' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => investmentsChangeHandler(inv.id, 'amount', value)} />
                  <TextInput value={inv.interest} keyboardType='number-pad' placeholder='Interest (in %)' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => investmentsChangeHandler(inv.id, 'interest', value)} />
                  <TouchableOpacity style={styles.removeBtn} activeOpacity={0.5} onPress={() => investmentsChangeHandler(inv.id)}>
                    <Ionicons name='trash-outline' color={COLORS.secondary} size={20} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.addRowBtn} activeOpacity={0.5} onPress={() => investmentsChangeHandler()}>
                <Ionicons name='add-circle-outline' color={COLORS.white} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputsGroup}>
              <Text style={styles.inputLable}> All Returns: </Text>
              {returns?.map(ret =>
                <View style={styles.inputsRow} key={ret.id}>
                  <TouchableOpacity onPress={() => openDatePicker(ret.id, 'returns', ret.date)} activeOpacity={1} style={{ marginTop: 5, flex: 1, marginRight: 5 }}>
                    <View style={styles.input}>
                      <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary, }}>
                        {ret.date.toDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TextInput value={ret.amount} keyboardType='number-pad' placeholder='Amount' style={{ ...styles.input, flex: 1 }} placeholderTextColor={COLORS.primary} onChangeText={(value) => returnsChangeHandler(ret.id, 'amount', value)} />
                  <TouchableOpacity style={styles.removeBtn} activeOpacity={0.5} onPress={() => returnsChangeHandler(ret.id)}>
                    <Ionicons name='trash-outline' color={COLORS.secondary} size={20} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.addRowBtn} activeOpacity={0.5} onPress={() => returnsChangeHandler()}>
                <Ionicons name='add-circle-outline' color={COLORS.white} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLable}>Investment Status: </Text>
            <View style={{ justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary }}>Active? :</Text>
              <Switch value={isActive} onValueChange={(value) => setIsActive(value)} thumbColor={isActive ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
            </View>
          </>
      }
    </FormModal>
  )
}

const styles = StyleSheet.create({
  input: {
    borderBottomColor: COLORS.secondary,
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 3,
    marginVertical: 3,
    fontSize: FONTS.body3.fontSize,
    fontFamily: FONTS.body3.fontFamily
  },
  inputLable: {
    color: COLORS.primary,
    paddingHorizontal: 3,
    marginTop: 20,
    fontSize: FONTS.h3.fontSize,
    fontFamily: FONTS.h3.fontFamily
  },
  inputsRow: {
    marginVertical: 5,
    marginHorizontal: 6,
    padding: 5,
    borderWidth: 1,
    borderBottomColor: COLORS.primary,
    borderRadius: 5,
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    right: -4,
    top: -12,
  },
  addRowBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 5,
  }
})

export default InvestmentForm;