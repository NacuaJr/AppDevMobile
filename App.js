import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen'; // will create this next
import SellerDashboard from './screens/SellerDashboard';
import CustomerDashboard from './screens/CustomerDashboard';
import SellerStack from './screens/SellerStack';
import ProfileScreen from './screens/ProfileScreen';
import CustomerBookingScreen from './screens/CustomerBookingScreen';
import CustomerBookingHistory from './screens/CustomerBookingHistory';
import SubmitReviewScreen from './screens/SubmitReviewScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SellerBookingsScreen from './screens/SellerBookingsScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SellerDashboard" component={SellerDashboard}  options={{ headerShown: false }} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="SellerStack" component={SellerStack}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="CustomerBookingScreen" component={CustomerBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerBookingHistory" component={CustomerBookingHistory} options={{ headerShown: false }} />
        <Stack.Screen name="SubmitReviewScreen" component={SubmitReviewScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SellerBookingsScreen" component={SellerBookingsScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
