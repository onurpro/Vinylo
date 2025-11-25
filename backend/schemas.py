from pydantic import BaseModel
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

    class Config:
        orm_mode = True

class VoteRequest(BaseModel):
    album1_id: int
    album2_id: int
    winner: str # "1" or "2"
