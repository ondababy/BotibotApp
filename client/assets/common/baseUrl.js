import {Platform} from 'react-native';

let baseURL = '';

<<<<<<< HEAD
if (Platform.OS === 'android') {
    baseURL = 'http://192.168.1.42:5000/api';
} else {
    baseURL = 'http://localhost:5000/api';
}

export { baseURL };
=======
if (Platform.OS == 'android') {
    baseURL = 'http://192.168.1.57:5000';
} else {
    baseURL = 'http://192.168.1.57:5000'; // Use same IP for iOS
}

export default baseURL;
export { baseURL as baseUrl }; // Named export for compatibility
>>>>>>> 5d9ce8a6db9b8eeb294dfba5876fef581260c24e
