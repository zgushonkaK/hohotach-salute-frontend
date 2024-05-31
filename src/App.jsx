import React from "react";
import {createAssistant, createSmartappDebugger} from "@salutejs/client";

import {createGlobalStyle} from 'styled-components';
import {accent, overlay, background, gradient, text} from '@salutejs/plasma-tokens';
import {salutejs_eva__dark, salutejs_joy__dark, salutejs_sber__dark} from '@salutejs/plasma-tokens/themes';
import {
  ActionButton, BodyL,
  Button,
  Card,
  CardContent,
  Cell,
  Col, Container,
  Row,
  TextBox, TextBoxCaption
} from '@salutejs/plasma-ui';
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
      characterID: 'Сбер',
      joke_id: '',
      alias: '',
      showFavorites: false,
      showPopup: false,
      showInfo: false,
      fav_joke_text: '',
    }

    this.favoriteButtons = [];
    this.favButtonRef = React.createRef();
    this.genButtonRef = React.createRef();
    this.addButtonRef = React.createRef();
    this.closeButtonRef = React.createRef();

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
      const favoriteButtons = this.favoriteButtons.filter((button) => button !== null);
      const currentIndex = favoriteButtons.findIndex((button) => button === document.activeElement);

      switch(event.code) {
        case 'ArrowDown':
          if (!this.state.showFavorites) {
            if (!document.activeElement || !this.isButton(document.activeElement)) {
              this.genButtonRef.current.focus();
            } else {
              this.genButtonRef.current.focus();
            }
          } else {
          event.preventDefault();
            if (currentIndex === -1) {
              favoriteButtons[0].focus();
            } else if (currentIndex < favoriteButtons.length - 1) {
              favoriteButtons[currentIndex + 1].focus();
            }
          }
          break;
        case 'ArrowUp':
          if (!this.state.showFavorites) {
            event.preventDefault();
            if (!document.activeElement || !this.isButton(document.activeElement)) {
              this.genButtonRef.current.focus();
            } else {
              this.favButtonRef.current.focus();
            }
          } else {
            event.preventDefault();
            if (currentIndex === -1) {
              favoriteButtons[0].focus();
            } else if (currentIndex > 0) {
              favoriteButtons[currentIndex - 1].focus();
            }
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (!this.state.showFavorites) {
            if (!document.activeElement || !this.isButton(document.activeElement)) {
              this.genButtonRef.current.focus();
            } else if (document.activeElement === this.addButtonRef.current) {
              this.genButtonRef.current.focus();
            }
          } else {
            this.closeButtonRef.current.focus();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!document.activeElement || !this.isButton(document.activeElement)) {
            this.genButtonRef.current.focus();
          } else if (document.activeElement === this.genButtonRef.current) {
            this.addButtonRef.current.focus();
          }
          break;
        case 'Enter':
          if (!this.state.showFavorites){
            event.preventDefault();
            if (document.activeElement === this.favButtonRef.current) {
              this.toggleFavorites();
            } else if (document.activeElement === this.genButtonRef.current) {
              this.fillTextField();
            } else if (document.activeElement === this.addButtonRef.current) {
              this.addFavorite();
            }
          } else {
            event.preventDefault();
            if (document.activeElement === this.closeButtonRef.current){
              this.toggleFavorites();
            } else if (currentIndex !== -1) {
              favoriteButtons[currentIndex].click();
            }
          }
          break;
      }
    });
  }

  isButton = (element) => {
    return element.tagName === 'BUTTON';
  }

  getStateForAssistant() {
    console.log('getStateForAssistant: this.state:', this.state)
    const state = {
      joke: {
        text: this.state.text,
        favorites: this.state.favorites,
        joke_id: this.state.joke_id,
      }
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
          //this._send_action_value('read_joke');
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

  _send_action_value(action_id) {
    const data = {
      action: {
        action_id: action_id,
        parameters: {
          showFavorites: this.state.showFavorites,
          joke: this.state.text,
        },
      },
    };
    console.log('popa', this.state.text);
    const unsubscribe = this.assistant.sendData(data, (data) => {
      // функция, вызываемая, если на sendData() был отправлен ответ
      const { type, payload } = data;
      console.log('sendData onData:', type, payload);
      unsubscribe();
    });
  }

  _send_joke_value(action_id, joke_text) {
    const data = {
      action: {
        action_id: action_id,
        parameters: {
          joke: joke_text,
        },
      },
    };
    console.log('popa', this.state.text);
    const unsubscribe = this.assistant.sendData(data, (data) => {
      // функция, вызываемая, если на sendData() был отправлен ответ
      const { type, payload } = data;
      console.log('sendData onData:', type, payload);
      unsubscribe();
    });
  }

  fillTextField = async () => {
    console.log('fill');
    try{
      const response = await api.get('/get_joke_from_api');
      this.setState({text: response.data.content, caption: ''});
      this._send_joke_value('read_joke', response.data.content);
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
          <DocStyles/>
          {(() => {
            switch (this.state.characterID) {
              case 'Сбер':
                return <ThemeBackgroundSber/>;
              case 'Афина':
                return <ThemeBackgroundEva/>;
              case 'Джой':
                return <ThemeBackgroundJoy/>;
              default:
                return;
            }
          })()}
          {this.state.showFavorites && (
              <div className="App-overlay">
                <div className="App-favorites-container" style={{background: overlay}}>
                      <ActionButton
                          ref={this.closeButtonRef}
                          size="m"
                          pin="circle-circle"
                          view="overlay"
                          onClick={() => {
                            this.toggleFavorites();
                            this._send_action_value('toggle_close');
                          }}
                          style={{marginLeft: ".5rem"}}
                      >
                        <IconCross/>
                      </ActionButton>

                    <div className="App-overlay-header">
                        <BodyL>Избранное</BodyL>
                    </div>


                  <ul style={{background: gradient}}>
                    {this.state.favorites.map((favorite, index) => (
                        <li>
                          <div key={favorite.id} className="App-list-item">
                            <Button ref={(ref) => { this.favoriteButtons[index] = ref; }}
                                    view="clear"
                                    size="m"
                                    text={favorite.name}
                                    style={{fontSize: "larger"}}
                                    onClick={() => {
                                      this.handleFavoriteClick(favorite.text);
                                      this.toggleFavorites();
                                      this._send_action_value('toggle_joke');
                                    }}>
                            </Button>
                          </div>
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
          )}
          <div className="App">
            <Container>
              <Row>
                <Col sizeS={1} sizeM={2} sizeL={3} sizeXL={4}
                     offsetS={3} offsetM={6} offsetL={8} offsetXL={12}>
                  <Button
                      ref={this.favButtonRef}
                      size="m"
                      pin="circle-circle"
                      view="clear"
                      onClick={() => {
                        this.toggleFavorites();
                        this._send_action_value('toggle_open');
                      }}
                      className="App-fav-button"
                      contentLeft={<IconHeart size={"m"}/>}>
                  </Button>
                </Col>
              </Row>
            </Container>

            <Row>
              <Col>
                <div className="App-logo">
                  <img src={logo} alt="" className="App-logo-pic"/>
                </div>
              </Col>
            </Row>

            <Row>
              <main className="App-main">
                <Card style={{minWidth: '10vw',
                              maxWidth: '75vw',
                              minHeight: '5rem',
                              fontSize: "larger"}}>
                  <CardContent compact>
                    <Cell
                        content={<TextBox size="l">
                                    <TextBoxCaption>{this.state.caption}</TextBoxCaption>
                                    {this.state.text}
                          </TextBox>}
                    />
                  </CardContent>
                </Card>
              </main>
            </Row>

            <footer className="App-footer">
              <Row>
                <Col sizeS={10} sizeM={2} sizeL={3} sizeXL={4}
                     style={{marginBottom: '.5rem'}}>
                  <Button
                      ref={this.genButtonRef}
                      size="l"
                      text="Сгенерируй анекдот"
                      onClick={this.fillTextField.bind(this)}
                      className="App-gen-button"
                      style={{'--hover-color': accent,
                              fontSize: "larger"}}>
                  </Button>
                </Col>

                <Col sizeS={10} sizeM={1} sizeL={3} sizeXL={4}
                     offsetS={0} offsetM={1.1} offsetL={1.1} offsetXL={2.1}>
                  <Button
                      ref={this.addButtonRef}
                      size="l"
                      text="Добавь в избранное"
                      onClick={this.addFavorite}
                      className="App-add-button"
                      style={{'--hover-color': this.getColor(),
                              fontSize: "larger"}}>
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