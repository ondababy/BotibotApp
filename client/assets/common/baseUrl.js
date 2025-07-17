import {Platform} from 'react-native';

let baseURL = '';

if (Platform.OS === 'android') {
    baseURL = 'http://192.168.1.40:5000';
} else {
    baseURL = 'http://localhost:5000';
}

export { baseURL };
