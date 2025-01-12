# python script that takes bingo card JSON file input, shuffles entires, then writes back to same file
# run via terminal command: shuffle_cards.py <card_file_name.json>

import json, sys, random, io

cardJSON = sys.argv[1]

with io.open(cardJSON, encoding='utf-8', mode='r') as file:
    cards = json.load(file)
    file.close()

for person in cards:
    # shuffle squares
    cardList = [] * 24
    for i in range(len(cards[person]['squares'])):
        cardList.append(cards[person]['squares'][i])
    random.shuffle(cardList)
    cards[person]['squares'] = cardList

    # reset selectedTiles int
    cards[person]['selectedTiles'] = 0

with io.open(cardJSON, encoding='utf-8', mode='w') as file:
    json.dump(cards, file, ensure_ascii=False, indent=4)
    file.close()