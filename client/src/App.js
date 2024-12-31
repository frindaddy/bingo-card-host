import './App.css';
import axios from "axios";
import React, { useState, useEffect } from "react";
import cards from './cards.js';

const currentYear = new Date().getFullYear();

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

    function getNavBarElement(internal_name, display_name) {
        return <p className={cardName === internal_name ? 'selected' : ''}
                  onClick={() => {
                      switchCard(internal_name)
                  }}>{display_name}</p>
    }

    return (
        <>
            <h1>Sasma's Hoes Bingo Cards 2k24</h1>
            <div className="card-selector">
                {getNavBarElement('andrew', 'Andrew')}
                {getNavBarElement('austin', 'Austin')}
                {getNavBarElement('brent', 'Brent')}
                {getNavBarElement('jacob', 'Jacob')}
                {getNavBarElement('sasha', 'Sasha')}
                {getNavBarElement('tim', 'Tim')}
                {getNavBarElement('trevor', 'Trevor')}
                {getNavBarElement('will', 'Will')}
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
            <footer style={{textAlign: "center", fontSize: "11px", color: "darkgray"}}>
            <p>©{currentYear} by Jacob Thweatt and Trevor Sides. All Rights Reserved.<br/>
                Powered by our pure genius.</p>
            </footer>
        </>
  );
}

export default App;
