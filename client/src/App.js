import './format/App.css';
import axios from "axios";
import React, { useState, useEffect, cloneElement } from "react";

const currentYear = new Date().getFullYear();

function App() {
    const [cardYear, setCardYear] = useState(new Date().getFullYear());
    const [selectedTiles, setSelectedTiles] = useState(0);
    const [cardName, setCardName] = useState('');
    const [cardTiles, setCardTiles] = useState([]);
    const [players, setPlayers] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedPlayerName, setSelectedPlayerName] = useState(['']);

    const getCardStatus = (name) => {
        axios.get('api/bingo_card/'+cardYear+name)
            .then((res) => {
                if (res.data) {
                    let tileMap = new Array(25).fill(null).map((u, i)=>{
                        if(i < 12){
                            return res.data.squares[i];
                        }
                        if(i === 12) return res.data.freespace;
                        if(i > 12){
                            return res.data.squares[i-1];
                        }
                    });
                    setCardTiles(tileMap);
                    setSelectedTiles(res.data.selectedTiles);
                }
            }).catch((err) => console.log(err));
    }

    const getPlayers = (year) => {
        axios.get('api/bingo_card/players/'+year)
            .then((res) => {
                if (res.data) {
                    setPlayers(res.data.players);
                }
            }).catch((err) => console.log(err));
    }

    const updateCard = (card_name, card_year, newSelectedTiles) => {
        axios.post('api/update_card/'+card_year, {
            name: card_name,
            selectedTiles: newSelectedTiles
        })
            .then(function (response) {
                getCardStatus(card_name);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    useEffect(() => {
        getPlayers(cardYear+'');
        if(cardName !== '') getCardStatus(cardName);
    }, [cardName, cardYear]);

    useEffect(()=>{
        if(cardName==='' && players !== undefined && players.length > 0) {
            setCardName(players[0][0])
        }
    }, [players])

    const switchCard = (player) => {
        setCardName(player);
        getCardStatus(player);
        setEditMode(false);
    }

    function sendDiscordMessage(message){
        axios.post('api/discord_bot', {
            payload: message
        })
            .catch(function (error) {
                console.log(error);
            });
    }

    function onTileClicked(index) {
        if(editMode){
            setSelectedTiles(selectedTiles ^ (1 << index))
            updateCard(cardName, cardYear, selectedTiles ^ (1 << index));
            if(!(selectedTiles & (1 << index))){
                sendDiscordMessage("# 🚨 BINGO ALERT 🚨\n\n"+
                    "***" + cardTiles[index] + "*** on **" + selectedPlayerName + "'s** square has been checked!\n"+
                    "-# Go to [the site](https://bingo.icebox.pw) to check it out!");
            }
        }
    }

    function getTableCell(index) {
        return <td style={{color: (selectedTiles & (1 << index)) > 0 ? "red":"white"}} onClick={() => {
            onTileClicked(index)
        }}><div className="square">{cardTiles[index]}</div></td>
    }

    function getNavBarElement(internal_name, display_name) {
        return <p className={cardName === internal_name ? 'selected' : ''}
                  onClick={() => {
                      switchCard(internal_name);
                      setSelectedPlayerName(display_name);
                  }}>{display_name}</p>
    }

    function changeYear(e) {
        setCardName('')
        setCardYear(e.target.value)
        setEditMode(false);
    }

    return (
        <>
            <div className='title-container'>
                <span className='title'>Bingo Cards</span>
                <select onChange={changeYear} defaultValue="2025">
                    <option value={'2024'}>2024</option>
                    <option value={'2025'}>2025</option>
                </select>
            </div>
            <div className="card-selector">
                {players !== undefined && players.map(player =>{
                    return getNavBarElement(player[0], player[1]);
                })}
            </div>
            <hr></hr>
            {cardName !== '' && <table className="bingo-card" style={editMode?{cursor:"pointer"}:{}}>
                <tbody>
                    <tr>
                        {getTableCell(0)}
                        {getTableCell(1)}
                        {getTableCell(2)}
                        {getTableCell(3)}
                        {getTableCell(4)}
                    </tr>
                    <tr>
                        {getTableCell(5)}
                        {getTableCell(6)}
                        {getTableCell(7)}
                        {getTableCell(8)}
                        {getTableCell(9)}
                    </tr>
                    <tr>
                        {getTableCell(10)}
                        {getTableCell(11)}
                        {getTableCell(12)}
                        {getTableCell(13)}
                        {getTableCell(14)}
                    </tr>
                    <tr>
                        {getTableCell(15)}
                        {getTableCell(16)}
                        {getTableCell(17)}
                        {getTableCell(18)}
                        {getTableCell(19)}
                    </tr>
                    <tr>
                        {getTableCell(20)}
                        {getTableCell(21)}
                        {getTableCell(22)}
                        {getTableCell(23)}
                        {getTableCell(24)}
                    </tr>
                </tbody>
            </table>}
            <div style={{display:"flex", justifyContent: 'center', paddingTop: "20px", paddingBottom: "10px"}}>
                <div style={{paddingRight: "15px", display: 'flex', alignItems: 'center'}}>{editMode ? "Editing Enabled":"Card Locked"}</div>
                <label class="switch">
                    <input type="checkbox" checked={!editMode} onClick={()=>{setEditMode(!editMode)}}></input>
                    <span class="slider round"></span>
                </label>
            </div>
            <footer style={{textAlign: "center", fontSize: "11px", color: "darkgray"}}>
            <p>©{currentYear} by Jacob Thweatt and Trevor Sides. All Rights Reserved.<br/>
                Powered by our pure genius.</p>
            </footer>
        </>
  );
}

export default App;
