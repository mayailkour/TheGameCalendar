import React from 'react';
import {
  Router as Router,
  Route,
} from "react-router-dom";
import '../styles/App.scss';
import Calendar from './Calendar';
import GameViewModal from './GameViewModal';
import SidePanel from './SidePanel';
import axios from 'axios';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';
import { 
  submitFilterAnalytic,
  submitSearchAnalytic,
  submitModalAnalytic,
  submitPageViewAnalytic
} from '../utils/Analytics';

const history = createBrowserHistory();
const host = window.location.hostname;
const apiUrl = 'http://game-calendar-web-service.us-east-2.elasticbeanstalk.com/';

if (host != "localhost") {
  const trackingId = "UA-142536846-1";
  ReactGA.initialize(trackingId, {
    debug: false,
  });
  history.listen(location => {
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: (new Date().getMonth()+1),
      currentYear: (new Date().getFullYear()),
      yearBoundary: 0,
      months: ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ],
      shortMonths: ["Jan", "Feb", "March", "April", "May", "June",
        "July", "Aug", "Sept", "Oct", "Nov", "Dec"
      ] ,
      filterProps: {
        platforms: [ ],
        nameText: ''
      },
      modalGame: {},
      loading: false
    };
  }

  nextMonth = () => {
    // If we are within the 4 month navigation limit
    if (this.state.yearBoundary < 4) {
      this.state.yearBoundary++;
      // If the current month is Dec then cycle the year and reset to Jan
      if (this.state.currentMonth === 12) {
        this.setState({
          currentMonth: 1,
          currentYear: this.state.currentYear + 1
        })
      } else {
        // Else navigate to next month
        this.setState({
          currentMonth: this.state.currentMonth + 1
        })
      }
      // Return to the top of the page
      document.getElementById('monthView').scrollIntoView();
    }
  }

  prevMonth = () => {
    // If we are within the 4 month navigation limit
    if (this.state.yearBoundary > -4) {
      this.state.yearBoundary--;
      // If the current month is Jan then cycle the year back and reset to Dec
      if (this.state.currentMonth === 1) {
        this.setState({
          currentMonth: 12,
          currentYear: this.state.currentYear - 1
        })
      } else {
        // Else navigate to previous month
        this.setState({
          currentMonth: this.state.currentMonth - 1
        })
      }
      // Return to the top of the page
      document.getElementById('monthView').scrollIntoView();
    }
  }

  search = (ev) => {
    const input = ev.target;
    // Only execute search for 3 or more characters
    if (input && input.value.length > 2) {
      // If not running locally, submit a ping for this search term
      submitSearchAnalytic(host, ReactGA, input.value);

      this.setState(oldState => {
        oldState.filterProps.nameText = input.value;
        return oldState;
      });
    } else {
      this.setState(oldState => {
        oldState.filterProps.nameText = '';
        return oldState;
      });
    }
  }

  setFilters = (ev) => {
    const input = ev.target;
    if (ev.target.checked) {
      // If not running locally, submit a ping for this filter
      submitFilterAnalytic(host, ReactGA, input.value);

      this.setState(state => {
        const platforms = state.filterProps.platforms;
        platforms.push(input.value);
        return {
          filterProps: {
            platforms: platforms,
            nameText: state.filterProps.nameText
          }
        };
      });
    } else {
      this.setState(state => {
        const platforms = state.filterProps.platforms.filter(platform => platform != input.value);
        return {
          filterProps: {
            platforms: platforms,
            nameText: state.filterProps.nameText
          }
        };
      });
    }
  }

  clearFilters = () => {
    let checkboxes = document.getElementsByClassName('filter-checkbox');
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
    this.setState(state => {
      return {
        filterProps: {
          platforms: [ ],
          nameText: state.filterProps.nameText
        }
      }
    });
  }

  displayDayModal = (game, date, platforms) => {
    const that = this;
    this.setState({
      loading: true
    });
    // Get the selected game's details
    axios.get(`${apiUrl}game?id=${game.id}`)
    .then(function (response) {
      // If not running locally, submit a ping for this game
      submitModalAnalytic(host, ReactGA, game.name)

      let gameResponse = response.data;
      // If no name has been provided, use the previously displayed name
      if (gameResponse.name === undefined) {
        gameResponse[0].name = game.name;
      }
      // Attach the release date and platforms to the new api response
      gameResponse[0].jsReleaseDate = date;
      gameResponse[0].platforms = platforms;
      that.setState({
        modalGame: gameResponse[0],
        loading: false
      });
    })
    .catch(function (err) {
      console.log(err)
    });

    // Show the modal and veil
    document.getElementById('modal').classList.remove('is-hidden');
    document.getElementById('calendar').classList.add('modal-open');
    document.getElementById('sidePanel').classList.add('modal-open');
    document.getElementById('body').classList.add('modal-open');
    document.getElementById('veil').classList.remove('is-hidden');
  }

  componentDidMount() {
    submitPageViewAnalytic(host, ReactGA, window.location.pathname + window.location.search);
  }

  render() {
    return (
      <Router history={history}>
        <div className="App" role="main">
          <div className="body-panel">
            <Route path="/">
              <SidePanel
                month={this.state.months[this.state.currentMonth-1]}
                monthId={this.state.currentMonth}
                currentYear={this.state.currentYear}
                shortMonth={this.state.shortMonths[this.state.currentMonth-1]}
                yearBoundary={this.state.yearBoundary}
                nextMonth={this.nextMonth}
                prevMonth={this.prevMonth}
                setFilters={this.setFilters}
                clearFilters={this.clearFilters}
                search={this.search}
              />
              <Calendar
                currentMonth={this.state.currentMonth}
                currentYear={this.state.currentYear}
                displayDayModal={this.displayDayModal}
                filterProps={this.state.filterProps}
              />
              <GameViewModal
                game={this.state.modalGame}
                loading={this.state.loading}
              />
            </Route>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
