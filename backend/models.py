from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)  # To support multiple users
    name = Column(String, index=True)
    artist_name = Column(String, index=True)
    url = Column(String)
    mbid = Column(String, nullable=True)
    image_url = Column(String)
    playcount = Column(Integer, default=0)
    elo_score = Column(Float, default=1500.0)
    ignored = Column(Boolean, default=False)
    source = Column(String, default="lastfm")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "artistName": self.artist_name,
            "url": self.url,
            "mbid": self.mbid,
            "imageURL": self.image_url,
            "playcount": self.playcount,
            "eloScore": self.elo_score,
            "ignored": self.ignored
        }

class UserSettings(Base):
    __tablename__ = "user_settings"

    username = Column(String, primary_key=True, index=True)
    source = Column(String, primary_key=True, index=True)
    scrobble_threshold = Column(Integer, default=50)
