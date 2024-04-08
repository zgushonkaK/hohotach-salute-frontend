import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";

import './App.css';
import jsonData from './test-data.json';

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

  constructor(props) {
    super(props);
    console.log('constructor');

    this.state = {
      text: '',
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event;
      console.log('action cur = ', action);
      this.dispatchAssistantAction(action); //запуск в теории сгенерируй анекдот покажи расскажи выкинь выведи
    });

    this.assistant.on("start", (event) => {

      let initialData = this.assistant.getInitialData();

      console.log(`assistant.on(start)`, event, initialData);
    });
    
  }

  getStateForAssistant() {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      joke: {
        text: this.text,
      },
    };
    console.log('getStateForAssistant: state:', state)
    return state;
  }

  dispatchAssistantAction(action){
    console.log('dispatchAssistantAction', action);
    /*
    if (action){
      switch (action.type) {
        case 'generate_joke':
          this.fillTextField(action);
          break;
        default:
          throw new Error();
      }
    }
    */
  }

  getJokeFromJson = () => {
    const content = jsonData.content;
    return content;
  }

  fillTextField(action) {
    console.log('fillTextField', action)
    //Мы тут типо как-то получаем анекдот и преобразовываем его в строку newText
    let newText = this.getJokeFromJson();
    this.setState({text: newText});
  }

  render(){
    return (
      <body>
        <div className="App">
          <header className="App-header">
            <p className="App-header-text">Tut budet logo</p>
          </header>
          <main className="App-main">
            <textarea
              value={this.state.text}
              onChange={() => {}}
              className="App-textarea"
              rows={15}
              readOnly
            />
          </main>
          <footer className="App-footer">
            <button onClick={this.fillTextField.bind(this)} className="App-button">
              Сгенерируй анекдот
            </button>
          </footer>
        </div>
      </body>
    )
}
}