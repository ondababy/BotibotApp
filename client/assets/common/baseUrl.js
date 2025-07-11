import {Platform} from 'react-native';

let baseURL = '';

if (Platform.OS == 'android') {
    baseURL = 'http://192.168.1.57:5000';
} else {
    baseURL = 'http://192.168.1.57:5000'; // Use same IP for iOS
}

export default baseURL;
export { baseURL as baseUrl }; // Named export for compatibility