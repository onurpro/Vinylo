import math

from .models import Album

DIVISOR = 400
K_FACTOR = 30

def expectedScore(rating1, rating2):
    return 1 / (1 + math.pow(10, (rating1 - rating2) / 400))

def calculateNewRating(album1, album2, score):
    rating1 = album1.eloScore
    rating2 = album2.eloScore

    #DEBUG LINE
    print(f"Album 1 score {rating1}. \n Album 2 score {rating2}.")

    probabilityAlbum1 = expectedScore(rating1, rating2)
    probabilityAlbum2 = expectedScore(rating2, rating1)

    album1.eloScore = rating1 + K_FACTOR * (score - probabilityAlbum1)
    album2.eloScore = rating2 + K_FACTOR * ((1-score) - probabilityAlbum2)

    #DEBUG LINE
    print(f"Album 1 new score {rating1}. \n Album 2 new score {rating2}.")