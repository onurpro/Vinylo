import random
import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from .api_client import getAlbums
from .elo_ranker import calculateNewRating
from .storage import save_data, load_data

app = Flask(__name__)
app.secret_key = os.urandom(24)

# In-memory cache: username -> list of Album objects
ALBUM_CACHE = {}

def get_user_albums(username):
    if username not in ALBUM_CACHE:
        print(f"Loading data for {username}...")
        albums = load_data(username)
        if not albums:
            print(f"Fetching from Last.fm for {username}...")
            try:
                albums = getAlbums(username)
                if albums:
                    save_data(username, albums)
                else:
                    # Could be empty list (valid) or None (error)
                    # getAlbums now returns None on error
                    if albums is None:
                        return None
            except Exception as e:
                print(f"Error in get_user_albums: {e}")
                return None
        ALBUM_CACHE[username] = albums or []
    return ALBUM_CACHE[username]

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        username = request.form.get('username')
        if username:
            session['username'] = username.strip()
            # Pre-load data
            albums = get_user_albums(session['username'])
            if albums is None:
                # Error occurred
                session.pop('username', None)
                return render_template('index.html', error="Could not fetch albums from Last.fm. Please check the username or try again later.")
            return redirect(url_for('index'))
    
    username = session.get('username')
    return render_template('index.html', username=username)

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/play')
def play():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    username = session['username']
    albums = get_user_albums(username)

    # Filter out ignored albums and "clutter" (low plays, EPs, Singles)
    # Criteria:
    # 1. Not explicitly ignored
    # 2. Playcount >= 10 (configurable)
    # 3. Title does not contain " EP", " Single", etc.
    
    MIN_PLAYCOUNT = 50
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

    active_albums = [a for a in albums if is_valid_album(a)]
    
    if len(active_albums) < 2:
        return "Not enough active albums to play."
    
    # Select two distinct random albums from active list
    a1, a2 = random.sample(active_albums, 2)
    
    # Get their original indices in the main ALBUMS list
    idx1 = albums.index(a1)
    idx2 = albums.index(a2)
    
    return render_template('play.html', album1=a1, album2=a2, idx1=idx1, idx2=idx2)

@app.route('/api/vote', methods=['POST'])
def vote():
    if 'username' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    username = session['username']
    albums = get_user_albums(username)
    
    data = request.json
    idx1 = data.get('idx1')
    idx2 = data.get('idx2')
    winner = data.get('winner') # '1' or '2'
    
    if idx1 is None or idx2 is None or winner not in ['1', '2']:
        return jsonify({'error': 'Invalid data'}), 400
    
    try:
        idx1 = int(idx1)
        idx2 = int(idx2)
        a1 = albums[idx1]
        a2 = albums[idx2]
        
        score = 1 if winner == '1' else 0
        calculateNewRating(a1, a2, score)
        
        # Auto-save
        save_data(username, albums)
        
        return jsonify({'success': True, 'new_scores': {'a1': a1.eloScore, 'a2': a2.eloScore}})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/api/ignore', methods=['POST'])
def ignore_album():
    if 'username' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    username = session['username']
    albums = get_user_albums(username)
    
    data = request.json
    idx = data.get('idx')
    
    if idx is None:
        return jsonify({'error': 'Invalid data'}), 400
        
    try:
        idx = int(idx)
        albums[idx].ignored = True
        save_data(username, albums)
        return jsonify({'success': True})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/api/unignore', methods=['POST'])
def unignore_album():
    if 'username' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    username = session['username']
    albums = get_user_albums(username)
    
    data = request.json
    idx = data.get('idx')
    
    if idx is None:
        return jsonify({'error': 'Invalid data'}), 400
        
    try:
        idx = int(idx)
        albums[idx].ignored = False
        save_data(username, albums)
        return jsonify({'success': True})
    except (IndexError, ValueError):
        return jsonify({'error': 'Album not found or invalid index'}), 404

@app.route('/ignored')
def ignored_albums():
    if 'username' not in session:
        return redirect(url_for('index'))
        
    username = session['username']
    albums = get_user_albums(username)
    
    # Pass tuples of (index, album) so we can unignore by index
    ignored_list = [(i, a) for i, a in enumerate(albums) if a.ignored]
    return render_template('ignored.html', albums=ignored_list)

@app.route('/stats')
def stats():
    if 'username' not in session:
        return redirect(url_for('index'))
        
    username = session['username']
    albums = get_user_albums(username)
    
    # Only show active albums in stats
    active_albums = [a for a in albums if not a.ignored]
    sorted_albums = sorted(active_albums, key=lambda x: x.eloScore, reverse=True)
    return render_template('stats.html', albums=sorted_albums[:50]) # Top 50

if __name__ == '__main__':
    app.run(debug=True)
