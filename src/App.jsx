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
    //console.log('constructor');

    this.state = {
      text: '',
      favorites: [],
      user_id: '',
      joke_id: '',
      joke_name: '',
      joke_category: '',
      showFavorites: false,
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on("data", (event/*: any*/) => {
      //console.log(`assistant.on(data)`, event);
      const { action } = event;
      //console.log('action cur = ', action);
      this.dispatchAssistantAction(action); 
    });

    this.assistant.on("start", (event) => {
      //console.log(`assistant.on(start)`, event);
      //const { action } = event;
      //this.dispatchAssistantAction(action);
    });
    
    this.assistant.on("tts", (event) => {
      //console.log(`assistant.on(tts)`, event);
    });
  }

  getStateForAssistant() {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      joke: {
        text: this.text,
        favorites: this.favorites,
        joke_id: this.joke_id,
      },
    };
    console.log('getStateForAssistant: state:', state)
    return state;
  }

  dispatchAssistantAction(action){
    //console.log('dispatchAssistantAction', action);
    if (action){
      switch (action.type) {
        case 'generate_joke':
          this.fillTextField();
          break;
        case 'initialize_user':
          this.setState({user_id: action.id});
          console.log('user_is', action.id);
          break;
        default:
          throw new Error();
      }
    }
  }

  getJokeFromJson = () => {
    const content = jsonData.content;
    return content;
  }

  fillTextField() {
    //Мы тут типо как-то получаем анекдот и преобразовываем его в строку newText
    let newText = this.getJokeFromJson();
    this.setState({text: newText});
  }

  addFavorite = () => {
    const { jokeName } = this.state;
    if (jokeName.trim() !== '') {
      this.setState((prevState) => ({
        favorites: [...prevState.favorites, { id: Date.now(), name: jokeName }],
      }));
    }
  };

  removeFavorite = (id) => {
    this.setState((prevState) => ({
      favorites: prevState.favorites.filter((favorite) => favorite.id !== id),
    }));
  };

  toggleFavorites = () => {
    this.setState((prevState) => ({
      showFavorites: !prevState.showFavorites,
    }));
  };


  render(){
    return (
      <body>
        <div>
          <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={this.toggleFavorites}>
            Избранное
          </button>
          {this.state.showFavorites && (
            <div className="overlay">
              <div className="favorites-container">
                <button className="close-button" onClick={this.toggleFavorites}>
                  &times;
                </button>
                <h3>Список избранного:</h3>
                <ul>
                  {this.state.favorites.map((favorite) => (
                    <li key={favorite.id}>
                      {favorite.name}{' '}
                      <button onClick={() => this.removeFavorite(favorite.id)}>
                        Удалить
                      </button>
                    </li>
                ))}
                </ul>
                <button onClick={this.addFavorite}>Добавить в избранное</button>
              </div>
            </div>
          )}
        </div>
        <div className="App">
          <header className="App-header">
            <p className="App-header-text">ХОХОТАЧ</p>
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