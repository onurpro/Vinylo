import random
import sys
from .api_client import getAlbums
from .elo_ranker import calculateNewRating
from .storage import save_data, load_data

def get_username():
    return input("Enter your Last.fm username: ").strip()

def play_mode(username, albums):
    while True:
        if len(albums) < 2:
            print("Not enough albums to play.")
            break
            
        # Select two distinct random albums
        a1, a2 = random.sample(albums, 2)
        
        print("\n--- Matchup ---")
        print(f"1: {a1}")
        print(f"2: {a2}")
        print("----------------")
        print("Enter '1' or '2' to vote, or 's' to Save & Exit.")
        
        choice = input("Choice: ").strip().lower()
        
        if choice == '1':
            calculateNewRating(a1, a2, 1)
            print(f"Winner: {a1.name}")
        elif choice == '2':
            calculateNewRating(a1, a2, 0)
            print(f"Winner: {a2.name}")
        elif choice in ['s', 'q']:
            save_data(username, albums)
            print("Progress saved. Returning to main menu.")
            break
        else:
            print("Invalid input. Please try again.")

def show_scoreboard(albums):
    print("\n--- Scoreboard (Top 20) ---")
    sorted_albums = sorted(albums, key=lambda x: x.eloScore, reverse=True)
    for i, album in enumerate(sorted_albums[:20], 1):
        print(f"{i}. {album}")
    print("---------------------------")
    input("Press Enter to return to menu...")

def main():
    print("Welcome to Album ELO Rater!")
    username = get_username()
    
    # Try to load existing data
    albums = load_data(username)
    
    if not albums:
        print("No saved data found. Fetching from Last.fm...")
        albums = getAlbums(username)
        if not albums:
            print("No albums found or error fetching data. Exiting.")
            return
        # Save initial data
        save_data(username, albums)
    
    while True:
        print(f"\nMain Menu ({username})")
        print("1. Play")
        print("2. Scoreboard")
        print("3. Exit")
        
        choice = input("Select an option: ").strip()
        
        if choice == '1':
            play_mode(username, albums)
        elif choice == '2':
            show_scoreboard(albums)
        elif choice == '3':
            # Auto-save on exit? Or just exit? 
            # Plan said "Save & Exit" in play mode. 
            # Let's offer to save here too just in case, or just exit.
            # For safety, let's save on exit too.
            save_data(username, albums)
            print("Goodbye!")
            sys.exit(0)
        else:
            print("Invalid option.")

if __name__ == "__main__":
    main()