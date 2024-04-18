import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import './App.css';
import jsonData from './test-data.json';
import logo from './images/HOHOTACHv2.png'

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
        case 'open_favorites':
          this.toggleFavorites();
          break;
        case 'close_favorites':
          this.toggleFavorites();
          break;
        case 'add_favorites':
          this.addFavorite();
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

  getJokeNameFromJson = () =>{
    const name = jsonData.Name;
    return name;
  }

  fillTextField() {
    //Мы тут типо как-то получаем анекдот и преобразовываем его в строку newText
    let newText = this.getJokeFromJson();
    let newName = this.getJokeNameFromJson();
    this.setState({text: newText});
    this.setState({joke_name: newName});
  }

  addFavorite = () => {
    const { joke_name } = this.state;
    if (joke_name.trim() !== '') {
      this.setState((prevState) => ({
        favorites: [...prevState.favorites, { id: Date.now(), name: joke_name }],
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
          <button className="App-favorite-button" onClick={this.toggleFavorites}>
            Избранное*
          </button>
          {this.state.showFavorites && (
            <div className="App-overlay">
              <div className="App-favorites-container">
                <button className="App-close-button" onClick={this.toggleFavorites}>
                  &times;
                </button>
                <h3>Список избранного:</h3>
                <ul>
                  {this.state.favorites.map((favorite) => (
                    <li key={favorite.id}>
                      {favorite.name}{' '}
                      <IconButton aria-label="delete" onClick={() => this.removeFavorite(favorite.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </li>
                ))}
                </ul>
                <IconButton aria-label="add" onClick={this.addFavorite}>
                  <AddIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
        <div className="App">
          <div className="App-logo">
              <img src={logo} alt="" className="App-logo-pic" />
          </div>
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