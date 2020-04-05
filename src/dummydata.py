import sqlite3
import datetime
from random import randrange
import time

db = sqlite3.connect("stats.db")

fighters = ["Ness", "Wario", "Mario", "Donkey Kong", "Captain Falcon"]
numBattles = 0
wins = 0
charWins = [0, 0, 0, 0, 0]
charBattles = [0, 0, 0, 0, 0]

cursor = db.cursor()

for i in range(100):

    numBattles += 1

    date = datetime.datetime.now()

    userStocks = randrange(4)
    opponentStocks = 0
    won = True

    if userStocks == 0:
        opponentStocks = randrange(1, 4)
        won = False

    index = randrange(5)

    fighter = fighters[index]
    charBattles[index] += 1

    if won:
        wins += 1
        charWins[index] += 1

    sql = "INSERT INTO Battles VALUES (\"%s\", \"Bot\", %d, \"%s\", \"%s\", 9, %f, %f);" % (date, userStocks, fighter, opponentStocks, (wins/numBattles), (charWins[index]/charBattles[index]))
    print(sql)

    cursor.execute(sql)
    db.commit()

    time.sleep(0.1)

db.close()