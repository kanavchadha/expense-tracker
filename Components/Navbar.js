import { useContext } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { COLORS, FONTS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../Context/user';
import logo from '../assets/icon.png';

export default NavBar = () => {
    const { navigate } = useNavigation();
    const { userImage } = useContext(UserContext);

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                backgroundColor: COLORS.white,
            }}
        >
            <TouchableOpacity
                style={{ justifyContent: 'center' }}
                onPress={() => navigate('UserInfoForm')}
            >
                <Image source={{ uri: userImage }} resizeMode='contain'
                    style={{
                        width: 45,
                        height: 45,
                        borderRadius: 45,
                    }}
                />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={logo} style={{ width: 32, height: 32 }} />
                <Text style={{
                    ...FONTS.h1,
                    color: COLORS.primary,
                    textShadowColor: COLORS.lightBlue,
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2
                }}> My Expenses</Text>
            </View>

            <TouchableOpacity onPress={() => navigate('AppConfigsForm', {})} style={{ justifyContent: 'center' }} activeOpacity={0.6}>
                <Ionicons name='settings-sharp' size={32} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    )
}