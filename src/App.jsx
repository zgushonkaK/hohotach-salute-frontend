import React from "react";
import {createAssistant, createSmartappDebugger,} from "@salutejs/client";
import axios from 'axios';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import './App.css';
import api from './api.js'
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
      alias: '',
      showFavorites: false,
      showOverlay: false,
      fav_joke_text: '',
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

    window.addEventListener('keydown', (event) => {
      switch(event.code) {
        case 'ArrowDown':
          // вниз
          break;
         case 'ArrowUp':
          // вверх
          break;
         case 'ArrowLeft':
          // влево
          break;
         case 'ArrowRight':
          // вправо
          break;
         case 'Enter':
          // ок
         break;
      }
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
          this.setState({
            user_id: action.id,
          });
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

  fillTextField = async () => {
    console.log('fill');
    try{
      const response = await api.get('/get_joke_from_api');
      this.setState({text: response.data.content});
      console.log(response);
    } catch (error) {
      console.error(error);
    }
    //this.setState({joke_name: newName});
  }

  getOrCreateUser = async () => {
    const { user_id } = this.state;
    const url = `/get_or_create_user?user_id=${user_id}`;
    try{
      const response = await api.post(url);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  openFavorites = async() => {
    const { user_id } = this.state;
    const url = `/get_fav_jokes?user_id=${user_id}`;
    try{
      const response = await api.get(url);
      this.state.favorites = response.data.map(response => ({
        id: response.joke_id,
        name: response.alias,
        text: response.content
      }));
      console.log(response)
    } catch (error) {
      console.error(error);
    }
}

  addFavJoke = async () => {
    const { user_id, text } = this.state;
    if (text === "") {
      return {joke_id: "", alias: "", text: ""};
    }
    const url = `/add_fav_joke?content=${encodeURIComponent(text)}&user_id=${user_id}`;
    try {
      const response = await api.post(url);
      const { joke_id, alias } = response.data;
      console.log(response);
      this.setState({ joke_id, alias, text }, () => {
        console.log(this.state);
      });
      return { joke_id, alias, text };
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  addFavorite = async () => {
    const { joke_id, alias, text } = await this.addFavJoke();
    if (alias.trim() !== '' && joke_id !== '') {
      const joke_exists = this.state.favorites.some(fav => fav.id === joke_id);
      if (!joke_exists) {
        this.setState((state) => ({
          favorites: [...state.favorites, { id: joke_id, name: alias, text: text}],
        }), () => {
          console.log(this.state);
        });
      } else {
        console.log("Joke already exists in favorites");
      }
    }
    else {
      console.log("Nothing to add.")
    }
  };


  removeFavorite = async (id) => {
    this.setState((prevState) => ({
      favorites: prevState.favorites.filter((favorite) => favorite.id !== id),
    }));
    await api.delete(`/delete_fav_joke?joke_id=${id}`);
  };

  toggleFavorites = async () => {
    if (!this.state.showFavorites) {
      await this.openFavorites();
    }
    this.setState((prevState) => ({
      showFavorites: !prevState.showFavorites,
    }));
  };

  handleFavoriteClick = (joke_id) => {

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
                <div>
                  {this.state.favorites.map((favorite) => (
                      <li key={favorite.id} onClick={() => this.handleFavoriteClick(favorite.id)}>
                        {favorite.name}{' '}
                        <IconButton aria-label="delete" onClick={() => this.removeFavorite(favorite.id)}>
                          <DeleteIcon/>
                        </IconButton>
                      </li>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="App">
          <div className="App-logo">
            <img src={logo} alt="" className="App-logo-pic"/>
          </div>
          <main className="App-main">
            <textarea
                value={this.state.text}
                onChange={() => {
                }}
                className="App-textarea"
                rows={12}
                cols={45}
                readOnly
            />
          </main>
          <footer className="App-footer">
            <button onClick={this.fillTextField.bind(this)} className="App-gen-button">
              Сгенерируй анекдот
            </button>
            <button onClick={this.addFavorite} className="App-add-button">
              Добавь в избранное
            </button>
          </footer>
        </div>
      </body>
    )
  }
}