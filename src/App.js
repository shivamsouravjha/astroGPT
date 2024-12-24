import React from 'react';
import FileUpload from './components/fileUpload';
import { Provider } from 'react-redux';
import { store } from './redux/store';

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <h1>Secure File Sharing</h1>
                <FileUpload />
            </div>
        </Provider>
    );
}

export default App;