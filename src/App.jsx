import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";

import './App.css';

const initializeAssistant = (getState/*: any*/) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({getState});
};

export class App extends React.Component {

  constructor() {
    super();
    console.log('constructor');

    this.state = {
      text: '',
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    
  }

  fillTextField = () => {
    //Мы тут типо как-то получаем анекдот и преобразовываем его в строку newText
    let newText = '';
    this.setState({text: newText});
  }

  render(){
    return (
        <div className="App">
          <header className="App-header">
            <p className="App-header-text">Tut budet logo</p>
          </header>
          <main className="App-main">
            <textarea
              value={this.state.text}
              onChange={() => {}}
              className="App-textarea"
              rows={10}
              readOnly
            />
          </main>
          <footer className="App-footer">
            <button onClick={this.fillTextField} className="App-button">
              Сгенерируй анекдот
            </button>
          </footer>
        </div>
    )
}
}