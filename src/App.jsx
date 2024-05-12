import React from "react";
import {createAssistant, createSmartappDebugger} from "@salutejs/client";

/*import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import StarRounded from '@material-ui/icons/StarRounded';
import { Info } from '@material-ui/icons';*/

import {createGlobalStyle} from 'styled-components';
import {accent, overlay, background, gradient, text} from '@salutejs/plasma-tokens';
import {salutejs_eva__dark, salutejs_joy__dark, salutejs_sber__dark} from '@salutejs/plasma-tokens/themes';

import {ActionButton, Button, Card, CardContent, Cell, Col, Row, TextArea, TextBox} from '@salutejs/plasma-ui';
import {Container} from '@salutejs/plasma-ui/components/Grid';
import {IconCross, IconHeart, IconTrashFilled} from '@salutejs/plasma-icons';

import './App.css';
import api from './api.js'
import logo from './images/HOHOTACHv2.png'

const ThemeBackgroundEva = createGlobalStyle(salutejs_eva__dark);
const ThemeBackgroundJoy = createGlobalStyle(salutejs_joy__dark);
const ThemeBackgroundSber = createGlobalStyle(salutejs_sber__dark);

const DocStyles = createGlobalStyle`
  html {
    color: ${text};
    background-color: ${background};
    background-image: ${gradient};
    min-height: 100vh;
  }
`;


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
      caption: 'Здесь появится текст анекдота...',
      favorites: [],
      user_id: '',
      characterID: '',
      joke_id: '',
      alias: '',
      showFavorites: false,
      showPopup: false,
      fav_joke_text: '',
    }

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
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
        text: this.state.text,
        favorites: this.state.favorites,
        joke_id: this.state.joke_id,
      },
    };
    console.log('getStateForAssistant: state:', state)
    return state;
  }

  dispatchAssistantAction(action){
    console.log('dispatchAssistantAction', action);
    if (action){
      switch (action.type) {
        case 'generate_joke':
          this.fillTextField();
          break;
        case 'initialize_user':
          this.setState({
            user_id: action.id,
            characterID: action.characterID,
          });
          console.log('user_is', action.id, 'character', this.state.characterID);
          break;
        case 'open_favorites':
          this.toggleFavorites();
          break;
        case 'close_favorites':
          this.toggleFavorites();
          break;
        case 'add_favorite':
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
      this.setState({text: response.data.content, caption: ''});
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

  handleFavoriteClick = async (text) => {
    this.setState({text: text, caption: ''});
  };

  getColor = () => {
    switch (this.state.characterID) {
      case 'Сбер':
        return `rgba(225, 160, 55, 0.8)`;
      case 'Афина':
        return `rgba(250, 135, 170, 0.8)`;
      case 'Джой':
        return `rgba(250, 180, 80, 0.8)`;
      default:
        return;
    }
  }

  render(){
    return (
        <body>
          <div>
            <DocStyles />
            {(() => {
              switch (this.state.characterID) {
                case 'Сбер':
                  return <ThemeBackgroundSber />;
                case 'Афина':
                  return <ThemeBackgroundEva />;
                case 'Джой':
                  return <ThemeBackgroundJoy />;
                default:
                  return;
              }
            })()}
            {this.state.showFavorites && (
                <div className="App-overlay">
                  <div className="App-favorites-container" style={{background: overlay}} >
                    <ActionButton
                        size="m"
                        pin="circle-circle"
                        view="overlay"
                        onClick={this.toggleFavorites}>
                        <IconCross/>
                    </ActionButton>
                    <ul style={{ background: gradient}}>
                      {this.state.favorites.map((favorite) => (
                          <li>
                            <div key={favorite.id} className="App-list-item">
                              <Button view="clear"
                                      size="s"
                                      text={favorite.name}
                                      onClick={() => {
                                        this.handleFavoriteClick(favorite.text);
                                        this.toggleFavorites();
                                    }}>
                              </Button>
                              <ActionButton pin="circle-circle"
                                            view="clear"
                                            size="m"
                                            m="3"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Stop event propagation
                                              this.removeFavorite(favorite.id);
                                            }}>
                                <IconTrashFilled size="xs"/>
                              </ActionButton>
                            </div>
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>
            )}
            <div className="App">
              <div className="App-logo">
                <img src={logo} alt="" className="App-logo-pic"/>
              </div>
              <main className="App-main">
                <Card style={{ minWidth: '10vw', maxWidth: '80vw', minHeight: '5rem'}}>
                  <CardContent compact>
                    <Cell
                        content={<TextBox title={this.state.text} caption={this.state.caption}/>}
                    />
                    </CardContent>
                  </Card>
                </main>
                <footer className="App-footer">
                  <Row>
                    <Col sizeS={1} sizeM={2} sizeL={3} sizeXL={4}
                         style={{marginRight: '.5rem'}}>
                      <Button
                          size="s"
                          text="Сгенерируй анекдот"
                          onClick={this.fillTextField.bind(this)}
                          className="App-gen-button"
                          style={{ '--hover-color': accent}}>
                      </Button>
                    </Col>
                    <Col sizeS={1} sizeM={2} sizeL={3} sizeXL={4}
                         offsetS={1} offsetM={1} offsetL={1} offsetXL={2}
                         style={{marginRight: '.5rem'}}>
                      <Button
                          size="s"
                          text="Добавь в избранное"
                          onClick={this.addFavorite}
                          className="App-add-button"
                          style={{ '--hover-color': this.getColor()}}>
                      </Button>
                    </Col>
                  </Row>
                  <Row style={{marginTop: '.5rem'}}>
                    <Col sizeS={2} sizeM={2} sizeL={2} sizeXL={4}
                         offsetS={1} offsetM={2} offsetL={3} offsetXL={4}>
                      <Button
                          size="s"
                          pin="circle-circle"
                          onClick={this.toggleFavorites}
                          className="App-fav-button"
                          contentLeft={<IconHeart />}>
                      </Button>
                    </Col>
                  </Row>
                </footer>
              </div>
          </div>
        </body>
      )
    }
}