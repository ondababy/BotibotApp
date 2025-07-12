import {Platform} from 'react-native';

let baseURL = '';

if (Platform.OS === 'android') {
    baseURL = 'http://192.168.1.42:5000/api';
} else {
    baseURL = 'http://localhost:5000/api';
}

export { baseURL };