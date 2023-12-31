import logo from './logo.svg';
import './App.css';
import axios from "axios";
import React, { useState, useEffect } from "react";
import {FaXmark} from "react-icons/fa";

function test() {
  alert("test");
}

function App() {
    const [cardStatus, setCardStatus] = useState();
    const getCardStatus = (name) => {
        axios.get('api/bingo_card/'+name)
            .then((res) => {
                if (res.data) {
                    console.log(res.data);
                    setCardStatus(res.data);
                }
            }).catch((err) => console.log(err));
    }

    useEffect(() => {
        getCardStatus('trevor');
    }, []);

  return (
    <>
    <h1>Sasma's Hoes Bingo Cards 2k24</h1>
    <table className="card-selector">
        <tr>
            <td onClick={test}>Andrew</td>
            <td>Austin</td>
            <td>Brent</td>
            <td>Jacob</td>
            <td>Sasma</td>
            <td>Tim</td>
            <td>Trevor</td>
        </tr>
    </table>
    <hr></hr>
    <table className="bingo-card">
        <tr>
            <td onCLick={test}>Entry 1</td>
            <td>Entry 2</td>
            <td>Entry 3</td>
            <td>Entry 4</td>
            <td>Entry 5</td>
        </tr>
        <tr>
            <td>Entry 6</td>
            <td>Entry 7</td>
            <td>Entry 8</td>
            <td>Entry 9</td>
            <td>Entry 10</td>
        </tr>
        <tr>
            <td>Entry 11</td>
            <td>Entry 12</td>
            <td>FREE SPACE</td>
            <td>Entry 14</td>
            <td>Entry 15</td>
        </tr>
        <tr>
            <td>Entry 16</td>
            <td>Entry 17</td>
            <td>Entry 18</td>
            <td>Entry 19</td>
            <td>Entry 20</td>
        </tr>
        <tr>
            <td>Entry 21</td>
            <td>Entry 22</td>
            <td>Entry 23</td>
            <td>Entry 24</td>
            <td>Entry 25</td>
        </tr>
    </table>
    </>
  );
}

export default App;
