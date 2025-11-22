import random
from flask import Flask, render_template, request, jsonify, redirect, url_for
from .api_client import getAlbums
from .elo_ranker import calculateNewRating
from .storage import save_data, load_data

app = Flask(__name__)

# Global state (for simplicity in this session)
# In a real app, we'd use a database or session per user.
# Here we assume single user usage or shared state for demo.
USERNAME = "onur_pro" # Default, can be changed via UI if we add a login page
ALBUMS = []

def init_data():
    global ALBUMS
    ALBUMS = load_data(USERNAME)
    if not ALBUMS:
        print(f"Fetching data for {USERNAME}...")
        ALBUMS = getAlbums(USERNAME)
        if ALBUMS:
            save_data(USERNAME, ALBUMS)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play')
def play():
    # Filter out ignored albums and "clutter" (low plays, EPs, Singles)
    # Criteria:
    # 1. Not explicitly ignored
    # 2. Playcount >= 10 (configurable)
    # 3. Title does not contain " EP", " Single", etc.
    
    MIN_PLAYCOUNT = 10
    EXCLUDED_KEYWORDS = [" EP", " (EP)", " - EP", " Single", " (Single)", " - Single"]
    
    def is_valid_album(a):
        if a.ignored:
            return False
        if a.playcount < MIN_PLAYCOUNT:
            return False
        for keyword in EXCLUDED_KEYWORDS:
            if keyword.lower() in a.name.lower():
                return False
        return True

    active_albums = [a for a in ALBUMS if is_valid_album(a)]
    
    if len(active_albums) < 2:
        return "Not enough active albums to play."
    
    # Select two distinct random albums from active list
    a1, a2 = random.sample(active_albums, 2)
    
    # Get their original indices in the main ALBUMS list
    idx1 = ALBUMS.index(a1)
    idx2 = ALBUMS.index(a2)
    
    return render_template('play.html', album1=a1, album2=a2, idx1=idx1, idx2=idx2)

@app.route('/api/vote', methods=['POST'])
def vote():
    data = request.json
    idx1 = data.get('idx1')
    idx2 = data.get('idx2')
    winner = data.get('winner') # '1' or '2'
    
    if idx1 is None or idx2 is None or winner not in ['1', '2']:
        return jsonify({'error': 'Invalid data'}), 400
    
    try:
        idx1 = int(idx1)
        idx2 = int(idx2)
        a1 = ALBUMS[idx1]
        a2 = ALBUMS[idx2]
        
        score = 1 if winner == '1' else 0
        calculateNewRating(a1, a2, score)
        
        # Auto-save
        save_data(USERNAME, ALBUMS)
        
        return jsonify({'success': True, 'new_scores': {'a1': a1.eloScore, 'a2': a2.eloScore}})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/api/ignore', methods=['POST'])
def ignore_album():
    data = request.json
    idx = data.get('idx')
    
    if idx is None:
        return jsonify({'error': 'Invalid data'}), 400
        
    try:
        idx = int(idx)
        ALBUMS[idx].ignored = True
        save_data(USERNAME, ALBUMS)
        return jsonify({'success': True})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/api/unignore', methods=['POST'])
def unignore_album():
    data = request.json
    idx = data.get('idx')
    
    if idx is None:
        return jsonify({'error': 'Invalid data'}), 400
        
    try:
        idx = int(idx)
        ALBUMS[idx].ignored = False
        save_data(USERNAME, ALBUMS)
        return jsonify({'success': True})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/ignored')
def ignored_albums():
    # Pass tuples of (index, album) so we can unignore by index
    ignored_list = [(i, a) for i, a in enumerate(ALBUMS) if a.ignored]
    return render_template('ignored.html', albums=ignored_list)

@app.route('/stats')
def stats():
    # Only show active albums in stats
    active_albums = [a for a in ALBUMS if not a.ignored]
    sorted_albums = sorted(active_albums, key=lambda x: x.eloScore, reverse=True)
    return render_template('stats.html', albums=sorted_albums[:50]) # Top 50

if __name__ == '__main__':
    init_data()
    app.run(debug=True)
