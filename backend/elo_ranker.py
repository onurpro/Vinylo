import math

K_FACTOR = 30

def expected_score(rating1: float, rating2: float) -> float:
    return 1 / (1 + math.pow(10, (rating2 - rating1) / 400))

def calculate_new_rating(rating1: float, rating2: float, actual_score: float) -> tuple[float, float]:
    """
    Calculates new ratings for two players.
    actual_score: 1 if player1 won, 0 if player2 won, 0.5 for draw.
    Returns (new_rating1, new_rating2)
    """
    prob1 = expected_score(rating1, rating2)
    prob2 = expected_score(rating2, rating1)

    new_rating1 = rating1 + K_FACTOR * (actual_score - prob1)
    new_rating2 = rating2 + K_FACTOR * ((1 - actual_score) - prob2)

    return new_rating1, new_rating2
