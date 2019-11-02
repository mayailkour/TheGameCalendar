import React from 'react';
import xbox from '../images/xbox.svg';
import nSwitch from '../images/switch.svg';
import ps from '../images/ps.svg';
import pc from '../images/PC.svg';
import mac from '../images/Mac.svg';
import ios from '../images/iOS.svg';
import linux from '../images/Linux.svg';
import stadia from '../images/stadia.png';

function getLogo(name) {
  switch (name) {
    case 'Xbox One':
      return xbox;
    case 'PlayStation 4':
      return ps;
    case 'Nintendo Switch':
      return nSwitch;
    case 'PC (Microsoft Windows)':
      return pc;
    case 'Mac':
      return mac;
    case 'iOS':
      return ios;
    case 'Linux':
      return linux;
    case 'Google Stadia':
      return stadia;
    default:
      return '';
  }
}

function GameItem(props) {
  const gamelist = props.game.game;
  const releaseDate = new Date(props.game.date*1000);
  var result = props.game.platform.reduce((unique, o) => {
    if(!unique.some(obj => obj.name === o.name)) {
      unique.push(o);
    }
    return unique;
  },[]); 
  const platformList = result.sort((ela, elb) => {
    if ( ela.name < elb.name ) {
      return 1;
    }
    if ( ela.name > elb.name ) {
      return -1;
    }
    return 0;
  });

  const platformRenderList = [];

  platformList.map(el => platformRenderList.push(<div className='icon-wrapper'><img title={el.name} alt={el.name} className='platform-icon' src={getLogo(el.name)} /></div>));
  let coverUrl = props.game.game.cover ? props.game.game.cover.url.replace('thumb', 'cover_big') : '';

  return (
    <div onClick={() => props.displayModal(gamelist, props.date, platformList)} style={props.style} className={'game-item ' + props.className}>
      <div className='game-cover'>{props.game.game.cover && props.isbig ? <img src={coverUrl} /> : ''}</div>
      <div className='game-details'>
        <div className='game-title'>{gamelist.name}</div>
        <div className='popularity'>{gamelist.id}</div>
        <div className='platforms'>{platformRenderList}</div>
      </div>
    </div>
  );
}

export default GameItem;