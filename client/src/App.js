import logo from './logo.svg';
import './App.css';
import axios from "axios";
import React, { useState, useEffect } from "react";
import cards from './cards.js';
import {FaXmark} from "react-icons/fa";

function App() {
    const [cardInt, setCardInt] = useState();
    const [cardName, setCardName] = useState('andrew');
    const getCardStatus = (name) => {
        axios.get('api/bingo_card/'+name)
            .then((res) => {
                if (res.data) {
                    setCardName(res.data.name);
                    setCardInt(res.data.card);
                }
            }).catch((err) => console.log(err));
    }

    const updateCard = (card_name, card_data) => {
        axios.post('api/update_card/'+card_name, {
            name: card_name,
            card: card_data
        })
            .then(function (response) {
                getCardStatus(card_name);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    useEffect(() => {
        getCardStatus(cardName);
    }, []);

    const switchCard = (player) => {
        setCardName(player);
        getCardStatus(player);
    }

    function onTileClicked(index) {
        setCardInt(cardInt ^ (1 << index))
        updateCard(cardName, cardInt ^ (1 << index));
    }

    function getTableCell(index) {
        return <td style={{color: (cardInt & (1 << index)) > 0 ? "red":"white"}} onClick={() => {
            onTileClicked(index)
        }}><div className="square">{cards[cardName][index]}</div></td>
    }

    return (
        <>
            <h1>Sasma's Hoes Bingo Cards 2k24</h1>
    <div className="card-selector">
        <p onClick={() => {switchCard('andrew')}}>Andrew</p>
        <p onClick={() => {switchCard('austin')}}>Austin</p>
        <p onClick={() => {switchCard('brent')}}>Brent</p>
        <p onClick={() => {switchCard('jacob')}}>Jacob</p>
        <p onClick={() => {switchCard('sasha')}}>Sasha</p>
        <p onClick={() => {switchCard('tim')}}>Tim</p>
        <p onClick={() => {switchCard('trevor')}}>Trevor</p>
        <p onClick={() => {switchCard('will')}}>Will</p>
    </div>
    <hr></hr>
    <table className="bingo-card">
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
    </table>
    </>
  );
}

export default App;
