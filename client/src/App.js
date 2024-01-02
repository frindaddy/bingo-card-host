import logo from './logo.svg';
import './App.css';
import axios from "axios";
import React, { useState, useEffect } from "react";
import cards from './cards.js';
import {FaXmark} from "react-icons/fa";

function App() {
    const [cardStatus, setCardStatus] = useState();
    const [cardName, setCardName] = useState('andrew');
    const getCardStatus = (name) => {
        axios.get('api/bingo_card/'+name)
            .then((res) => {
                if (res.data) {
                    console.log(res.data);
                    setCardStatus(res.data);
                }
            }).catch((err) => console.log(err));
    }

    const updateCard = (card_name, card_data) => {
        axios.post('api/update_card/'+card_name, {
            name: card_name,
            card: card_data
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    useEffect(() => {
        getCardStatus(cardName);
        //updateCard('trevor', 10)
    }, []);

    const switchCard = (player) => {
        setCardName(player);
        getCardStatus(player);
    }

    function onTileClicked(index) {
        console.log('Toggle '+ cardName + ' tile ' + index);
    }

  return (
    <>
    <h1>Sasma's Hoes Bingo Cards 2k24</h1>
    <table className="card-selector">
        <tr>
            <td onClick={() => {switchCard('andrew')}}>Andrew</td>
            <td onClick={() => {switchCard('austin')}}>Austin</td>
            <td onClick={() => {switchCard('brent')}}>Brent</td>
            <td onClick={() => {switchCard('jacob')}}>Jacob</td>
            <td onClick={() => {switchCard('sasha')}}>Sasha</td>
            <td onClick={() => {switchCard('tim')}}>Tim</td>
            <td onClick={() => {switchCard('trevor')}}>Trevor</td>
            <td onClick={() => {switchCard('will')}}>Will</td>
        </tr>
    </table>
    <hr></hr>
    <table className="bingo-card">
        <tbody>
            <tr>
                <td onClick={()=>{onTileClicked(0)}}>{cards[cardName][0]}</td>
                <td onClick={()=>{onTileClicked(1)}}>{cards[cardName][1]}</td>
                <td onClick={()=>{onTileClicked(2)}}>{cards[cardName][2]}</td>
                <td onClick={()=>{onTileClicked(3)}}>{cards[cardName][3]}</td>
                <td onClick={()=>{onTileClicked(4)}}>{cards[cardName][4]}</td>
            </tr>
            <tr>
                <td onClick={() => {onTileClicked(5)}}>{cards[cardName][5]}</td>
                <td onClick={() => {onTileClicked(6)}}>{cards[cardName][6]}</td>
                <td onClick={() => {onTileClicked(7)}}>{cards[cardName][7]}</td>
                <td onClick={() => {onTileClicked(8)}}>{cards[cardName][8]}</td>
                <td onClick={() => {onTileClicked(9)}}>{cards[cardName][9]}</td>
            </tr>
            <tr>
                <td onClick={() => {onTileClicked(10)}}>{cards[cardName][10]}</td>
                <td onClick={() => {onTileClicked(11)}}>{cards[cardName][11]}</td>
                <td onClick={() => {onTileClicked(12)}}>{cards[cardName][12]}</td>
                <td onClick={() => {onTileClicked(13)}}>{cards[cardName][13]}</td>
                <td onClick={() => {onTileClicked(14)}}>{cards[cardName][14]}</td>
            </tr>
            <tr>
                <td onClick={() => {onTileClicked(15)}}>{cards[cardName][15]}</td>
                <td onClick={() => {onTileClicked(16)}}>{cards[cardName][16]}</td>
                <td onClick={() => {onTileClicked(17)}}>{cards[cardName][17]}</td>
                <td onClick={() => {onTileClicked(18)}}>{cards[cardName][18]}</td>
                <td onClick={() => {onTileClicked(19)}}>{cards[cardName][19]}</td>
            </tr>

            <tr>
                <td onClick={() => {onTileClicked(20)}}>{cards[cardName][20]}</td>
                <td onClick={() => {onTileClicked(21)}}>{cards[cardName][21]}</td>
                <td onClick={() => {onTileClicked(22)}}>{cards[cardName][22]}</td>
                <td onClick={() => {onTileClicked(23)}}>{cards[cardName][23]}</td>
                <td onClick={() => {onTileClicked(24)}}>{cards[cardName][24]}</td>
            </tr>
        </tbody>
    </table>
    </>
  );
}

export default App;
