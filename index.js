/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import LocationTask from './src/tasks/LocationTask';


AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerHeadlessTask('LocationTask', () => LocationTask);
