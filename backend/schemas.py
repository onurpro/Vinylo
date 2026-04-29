from pydantic import BaseModel, ConfigDict
from typing import Optional

class AlbumBase(BaseModel):
    name: str
    artist_name: str
    url: str
    mbid: Optional[str] = None
    image_url: str
    playcount: int = 0
    elo_score: float = 1500.0
    ignored: bool = False
    source: str = "lastfm"
    username: str

class AlbumCreate(AlbumBase):
    pass

class Album(AlbumBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class VoteRequest(BaseModel):
    album1_id: int
    album2_id: int
    winner: str  # "1" or "2"

class UserSettingsBase(BaseModel):
    scrobble_threshold: int = 50

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    username: str
    source: str
    model_config = ConfigDict(from_attributes=True)
